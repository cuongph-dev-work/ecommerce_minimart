import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager, LockMode } from '@mikro-orm/core';
import { Order, OrderStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { ContactHistory } from '../../entities/contact-history.entity';
import { Product } from '../../entities/product.entity';
import { Store } from '../../entities/store.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { VouchersService } from '../vouchers/vouchers.service';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { generateUniqueOrderNumber } from '../../common/utils/order-number.util';

@Injectable()
export class OrdersService {
  constructor(
    private readonly em: EntityManager,
    private readonly vouchersService: VouchersService,
  ) {}

  async create(createDto: CreateOrderDto): Promise<Order> {
    // Use transaction to ensure atomicity and prevent race conditions
    return await this.em.transactional(async (em) => {
      const store = await em.findOne(Store, { id: createDto.pickupStoreId, deletedAt: null });
      if (!store) {
        throw new NotFoundException('Store not found');
      }

      // First pass: Validate products and calculate totals with pessimistic lock
      let subtotal = 0;
      const productSkus: string[] = [];
      interface ProductItem {
        product: Product;
        item: { productId: string; quantity: number };
        itemPrice: number;
      }
      const products: ProductItem[] = [];

      for (const item of createDto.items) {
        // Lock product row to prevent concurrent modifications
        const product = await em.findOne(
          Product,
          { id: item.productId, deletedAt: null },
          { lockMode: LockMode.PESSIMISTIC_WRITE }
        );
        
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        // Check stock again after lock (double-check)
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }

        // Calculate price with discount if any
        const itemPrice = product.discount 
          ? Number(product.price) * (1 - Number(product.discount) / 100)
          : Number(product.price);
        
        const itemSubtotal = itemPrice * item.quantity;
        subtotal += itemSubtotal;
        
        // Collect SKU for order number generation
        if (product.sku) {
          productSkus.push(product.sku);
        }

        // Store product for later use
        products.push({ product, item, itemPrice });
      }

      // Apply voucher
      let discount = 0;
      if (createDto.voucherCode) {
        const voucherValidation = await this.vouchersService.validate({
          code: createDto.voucherCode,
          total: subtotal,
        });

        if (!voucherValidation.valid) {
          throw new BadRequestException(voucherValidation.message);
        }

        discount = voucherValidation.discount;
      }

      const total = subtotal - discount;

      // Generate unique order number based on customer info and product SKUs
      const orderNumber = await generateUniqueOrderNumber(
        em,
        createDto.customerPhone,
        createDto.customerEmail,
        productSkus,
      );

      // Create order
      const order = em.create(Order, {
        orderNumber,
        customerName: createDto.customerName,
        customerPhone: createDto.customerPhone,
        customerEmail: createDto.customerEmail,
        notes: createDto.notes,
        pickupStore: store,
        subtotal,
        discount,
        total,
        voucherCode: createDto.voucherCode,
        statusHistory: [{
          status: OrderStatus.PENDING,
          note: 'Đơn hàng mới',
          createdAt: new Date(),
          updatedBy: 'system',
        }],
      });

      await em.persistAndFlush(order);

      // Create order items and update stock atomically
      const orderItems: OrderItem[] = [];
      for (const { product, item, itemPrice } of products) {
        // Re-lock product to ensure we have latest data
        const lockedProduct = await em.findOne(
          Product,
          { id: product.id },
          { lockMode: LockMode.PESSIMISTIC_WRITE }
        );

        if (!lockedProduct) {
          throw new NotFoundException(`Product ${product.id} not found`);
        }

        // Final stock check before decrementing
        if (lockedProduct.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${lockedProduct.name}. Available: ${lockedProduct.stock}, Requested: ${item.quantity}`);
        }

        const orderItem = em.create(OrderItem, {
          order,
          product: lockedProduct,
          quantity: item.quantity,
          price: itemPrice, // Use snapshot price
          subtotal: itemPrice * item.quantity,
        });

        // Update product stock atomically
        lockedProduct.stock -= item.quantity;
        lockedProduct.soldCount += item.quantity;

        orderItems.push(orderItem);
      }

      await em.persistAndFlush(orderItems);

      // Increment voucher usage
      if (createDto.voucherCode) {
        await this.vouchersService.incrementUsage(createDto.voucherCode);
      }

      return order;
    });
  }

  async findAll(
    page: number = 1, 
    limit: number = 20, 
    search?: string, 
    status?: OrderStatus,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {};

    if (search) {
      where.$or = [
        { orderNumber: { $ilike: `%${search}%` } },
        { customerName: { $ilike: `%${search}%` } },
        { customerPhone: { $ilike: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        where.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.$lte = end;
      }
    }

    const offset = (page - 1) * limit;

    const [orders, total] = await this.em.findAndCount(Order, where, {
      populate: ['pickupStore', 'items', 'items.product'],
      orderBy: { createdAt: 'DESC' },
      limit,
      offset,
    });

    return createPaginatedResponse(orders, page, limit, total);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.em.findOne(Order, { id }, {
      populate: ['pickupStore', 'items', 'items.product', 'contactHistory'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Track order by order number and phone number (public endpoint)
   */
  async trackOrder(orderNumber: string, phone: string): Promise<any> {
    const order = await this.em.findOne(
      Order,
      { 
        orderNumber: orderNumber.toUpperCase(), 
        customerPhone: phone 
      },
      {
        populate: ['pickupStore', 'items', 'items.product'],
      }
    );

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn hàng và số điện thoại.');
    }

    // Serialize order to ensure enum values are converted to strings
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: String(order.status), // Explicitly convert enum to string
      createdAt: order.createdAt.toISOString(),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      notes: order.notes,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      total: Number(order.total),
      pickupStore: order.pickupStore ? {
        id: order.pickupStore.id,
        name: order.pickupStore.name,
        address: order.pickupStore.address,
        phone: order.pickupStore.phone,
      } : undefined,
      items: order.items.getItems().map(item => ({
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.price), // Use snapshot price from orderItem
          image: item.product.images?.[0] || '',
        } : {
          id: null,
          name: 'Sản phẩm đã bị xóa',
          price: Number(item.price), // Use snapshot price
          image: '',
        },
        quantity: item.quantity,
        price: Number(item.price), // Always use snapshot price from orderItem
      })),
    };
  }

  async updateStatus(id: string, status: OrderStatus, note: string, updatedBy: string): Promise<Order> {
    const order = await this.findOne(id);

    order.status = status;
    
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status,
      note,
      createdAt: new Date(),
      updatedBy,
    });

    await this.em.flush();
    return order;
  }

  async updatePayment(id: string, updateDto: any, updatedBy: string): Promise<Order> {
    const order = await this.findOne(id);

    order.paymentStatus = updateDto.paymentStatus;
    
    // Save receipt images if provided
    if (updateDto.receiptImages !== undefined) {
      if (Array.isArray(updateDto.receiptImages) && updateDto.receiptImages.length > 0) {
        order.receiptImages = updateDto.receiptImages;
      } else if (updateDto.receiptImages === null || (Array.isArray(updateDto.receiptImages) && updateDto.receiptImages.length === 0)) {
        order.receiptImages = null;
      }
    }

    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: order.status,
      note: `Payment: ${updateDto.note || 'Đã thanh toán'}`,
      createdAt: new Date(),
      updatedBy,
    });

    await this.em.flush();
    return order;
  }

  async addContact(id: string, type: string, note: string, createdBy: string) {
    const order = await this.findOne(id);

    const contact = this.em.create(ContactHistory, {
      order,
      type: type as any,
      note,
      createdBy,
    });

    await this.em.persistAndFlush(contact);
    return contact;
  }

}


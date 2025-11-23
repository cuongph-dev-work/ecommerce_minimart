import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Order, OrderStatus, PaymentStatus } from '../../entities/order.entity';
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
    const store = await this.em.findOne(Store, { id: createDto.pickupStoreId });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Calculate totals and collect product SKUs
    let subtotal = 0;
    const orderItems: OrderItem[] = [];
    const productSkus: string[] = [];

    for (const item of createDto.items) {
      const product = await this.em.findOne(Product, { id: item.productId });
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      
      // Collect SKU for order number generation
      if (product.sku) {
        productSkus.push(product.sku);
      }
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
      this.em,
      createDto.customerPhone,
      createDto.customerEmail,
      productSkus,
    );

    // Create order
    const order = this.em.create(Order, {
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

    await this.em.persistAndFlush(order);

    // Create order items
    for (const item of createDto.items) {
      const product = await this.em.findOne(Product, { id: item.productId });
      if (!product) continue;

      const orderItem = this.em.create(OrderItem, {
        order,
        product,
        quantity: item.quantity,
        price: product.price,
        subtotal: product.price * item.quantity,
      });

      // Update product stock
      product.stock -= item.quantity;
      product.soldCount += item.quantity;

      orderItems.push(orderItem);
    }

    await this.em.persistAndFlush(orderItems);

    // Increment voucher usage
    if (createDto.voucherCode) {
      await this.vouchersService.incrementUsage(createDto.voucherCode);
    }

    return order;
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


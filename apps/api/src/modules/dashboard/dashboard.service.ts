import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Order, OrderStatus } from '../../entities/order.entity';
import { Product } from '../../entities/product.entity';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly em: EntityManager) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisYear = new Date();
    thisYear.setMonth(0, 1);
    thisYear.setHours(0, 0, 0, 0);

    // Revenue
    const todayRevenue = await this.calculateRevenue(today);
    const monthRevenue = await this.calculateRevenue(thisMonth);
    const yearRevenue = await this.calculateRevenue(thisYear);

    // Orders
    const totalOrders = await this.em.count(Order, {});
    const pendingOrders = await this.em.count(Order, { status: OrderStatus.PENDING });
    const processingOrders = await this.em.count(Order, { 
      status: { $in: [OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
    });
    const completedOrders = await this.em.count(Order, { status: OrderStatus.RECEIVED });
    const cancelledOrders = await this.em.count(Order, { status: OrderStatus.CANCELLED });

    // Products
    const totalProducts = await this.em.count(Product, {});
    const lowStock = await this.em.count(Product, { stock: { $lte: 10, $gt: 0 } });
    const outOfStock = await this.em.count(Product, { stock: 0 });

    // Customers
    const totalCustomers = await this.em.count(User, { role: UserRole.CUSTOMER });
    const newThisMonth = await this.em.count(User, {
      role: UserRole.CUSTOMER,
      createdAt: { $gte: thisMonth },
    });

    return {
      revenue: {
        today: todayRevenue,
        thisMonth: monthRevenue,
        thisYear: yearRevenue,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      products: {
        total: totalProducts,
        lowStock,
        outOfStock,
      },
      customers: {
        total: totalCustomers,
        newThisMonth,
      },
    };
  }

  async getTopProducts(limit: number = 10) {
    const products = await this.em.find(
      Product,
      {},
      {
        orderBy: { soldCount: 'DESC' },
        limit,
      },
    );

    return products;
  }

  async getRecentOrders(limit: number = 10) {
    const orders = await this.em.find(
      Order,
      {},
      {
        populate: ['pickupStore'],
        orderBy: { createdAt: 'DESC' },
        limit,
      },
    );

    return orders;
  }

  private async calculateRevenue(startDate: Date): Promise<number> {
    const orders = await this.em.find(Order, {
      status: OrderStatus.RECEIVED,
      createdAt: { $gte: startDate },
    });

    return orders.reduce((sum, order) => sum + Number(order.total), 0);
  }
}


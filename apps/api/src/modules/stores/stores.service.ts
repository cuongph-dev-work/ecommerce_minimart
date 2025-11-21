import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Store } from '../../entities/store.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { QueryStoreDto } from './dto/query-store.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class StoresService {
  constructor(private readonly em: EntityManager) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = this.em.create(Store, createStoreDto);
    await this.em.persistAndFlush(store);
    return store;
  }

  async findAll(query: QueryStoreDto) {
    const { page = 1, limit = 20, search, status, allowPickup, sortBy = 'created_at', sortOrder = 'desc' } = query;

    const qb = this.em.createQueryBuilder(Store, 's');

    // Search
    if (search) {
      qb.andWhere({
        $or: [
          { name: { $ilike: `%${search}%` } },
          { address: { $ilike: `%${search}%` } },
          { phone: { $ilike: `%${search}%` } },
        ],
      });
    }

    // Filter by status
    if (status) {
      qb.andWhere({ status });
    }

    // Filter by allowPickup
    if (allowPickup !== undefined) {
      qb.andWhere({ allowPickup });
    }

    // Sort
    const orderByField = sortBy === 'created_at' ? 'createdAt' : sortBy;
    qb.orderBy({ [orderByField]: sortOrder === 'asc' ? 'ASC' : 'DESC' });

    // Pagination
    const offset = (page - 1) * limit;
    qb.limit(limit).offset(offset);

    const [stores, total] = await qb.getResultAndCount();

    return createPaginatedResponse(stores, page, limit, total);
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.em.findOne(Store, { id });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);
    this.em.assign(store, updateStoreDto);
    await this.em.flush();
    return store;
  }

  async remove(id: string): Promise<void> {
    const store = await this.findOne(id);

    // Check for pending orders
    const pendingOrders = await this.em.count(Order, {
      pickupStore: store,
      status: {
        $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY],
      },
    });

    if (pendingOrders > 0) {
      throw new BadRequestException(`Cannot delete store with ${pendingOrders} pending orders`);
    }

    await this.em.removeAndFlush(store);
  }

  async getStoreOrders(storeId: string, status?: OrderStatus) {
    const store = await this.findOne(storeId);

    const where: any = { pickupStore: store };
    if (status) {
      where.status = status;
    }

    const orders = await this.em.find(Order, where, {
      orderBy: { createdAt: 'DESC' },
    });

    return orders;
  }
}


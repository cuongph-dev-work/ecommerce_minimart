import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Banner } from '../../entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class BannersService {
  constructor(private readonly em: EntityManager) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = this.em.create(Banner, createBannerDto);
    await this.em.persistAndFlush(banner);
    return banner;
  }

  async findAll(query: QueryBannerDto) {
    const { page = 1, limit = 20, search, status, sortBy = 'sortOrder', sortOrder = 'asc' } = query;

    const qb = this.em.createQueryBuilder(Banner, 'b');

    // Search
    if (search) {
      qb.andWhere({ title: { $ilike: `%${search}%` } });
    }

    // Filter by status
    if (status) {
      qb.andWhere({ status });
    }

    // Sort
    const orderByField = sortBy === 'created_at' ? 'createdAt' : sortBy;
    qb.orderBy({ [orderByField]: sortOrder === 'asc' ? 'ASC' : 'DESC' });

    // Pagination
    const offset = (page - 1) * limit;
    qb.limit(limit).offset(offset);

    const [banners, total] = await qb.getResultAndCount();

    return createPaginatedResponse(banners, page, limit, total);
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.em.findOne(Banner, { id });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);
    this.em.assign(banner, updateBannerDto);
    await this.em.flush();
    return banner;
  }

  async remove(id: string): Promise<void> {
    const banner = await this.findOne(id);
    await this.em.removeAndFlush(banner);
  }
}


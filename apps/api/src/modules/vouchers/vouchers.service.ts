import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Voucher, VoucherStatus } from '../../entities/voucher.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class VouchersService {
  constructor(private readonly em: EntityManager) {}

  async create(createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    // Check code uniqueness
    const existing = await this.em.findOne(Voucher, { code: createVoucherDto.code });
    if (existing) {
      throw new ConflictException('Voucher code already exists');
    }

    const voucher = this.em.create(Voucher, createVoucherDto);
    await this.em.persistAndFlush(voucher);
    return voucher;
  }

  async findAll(query: QueryVoucherDto) {
    const { page = 1, limit = 20, search, status, type, sortBy = 'created_at', sortOrder = 'desc' } = query;

    const where: any = {};

    // Search
    if (search) {
      where.$or = [
        { code: { $ilike: `%${search}%` } },
        { title: { $ilike: `%${search}%` } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Sort
    const orderByField = sortBy === 'created_at' ? 'createdAt' : sortBy;
    const orderBy: any = { [orderByField]: sortOrder === 'asc' ? 'ASC' : 'DESC' };

    // Pagination
    const offset = (page - 1) * limit;

    const [vouchers, total] = await this.em.findAndCount(Voucher, where, {
      orderBy,
      limit,
      offset,
    });

    return createPaginatedResponse(vouchers, page, limit, total);
  }

  async findOne(id: string): Promise<Voucher> {
    const voucher = await this.em.findOne(Voucher, { id });

    if (!voucher) {
      throw new NotFoundException('Voucher not found');
    }

    return voucher;
  }

  async update(id: string, updateVoucherDto: UpdateVoucherDto): Promise<Voucher> {
    const voucher = await this.findOne(id);
    this.em.assign(voucher, updateVoucherDto);
    await this.em.flush();
    return voucher;
  }

  async remove(id: string): Promise<void> {
    const voucher = await this.findOne(id);
    await this.em.removeAndFlush(voucher);
  }

  async validate(validateDto: ValidateVoucherDto) {
    const voucher = await this.em.findOne(Voucher, { code: validateDto.code });

    if (!voucher) {
      return {
        valid: false,
        message: 'Voucher not found',
        discount: 0,
      };
    }

    // Check status
    if (voucher.status !== VoucherStatus.ACTIVE) {
      return {
        valid: false,
        message: 'Voucher is not active',
        discount: 0,
      };
    }

    // Check expiry date
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return {
        valid: false,
        message: 'Voucher has expired',
        discount: 0,
      };
    }

    // Check max uses
    if (voucher.maxUses && voucher.usedCount >= voucher.maxUses) {
      return {
        valid: false,
        message: 'Voucher usage limit reached',
        discount: 0,
      };
    }

    // Check min purchase
    if (voucher.minPurchase > 0 && validateDto.total < voucher.minPurchase) {
      return {
        valid: false,
        message: `Minimum purchase amount is ${voucher.minPurchase}`,
        discount: 0,
      };
    }

    // Calculate discount
    let discount = 0;
    if (voucher.type === 'fixed') {
      discount = voucher.discount;
    } else {
      // Percentage
      discount = (validateDto.total * voucher.discount) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    }

    return {
      valid: true,
      message: 'Voucher is valid',
      discount,
    };
  }

  async incrementUsage(code: string): Promise<void> {
    const voucher = await this.em.findOne(Voucher, { code });
    if (voucher) {
      voucher.usedCount += 1;
      await this.em.flush();
    }
  }
}


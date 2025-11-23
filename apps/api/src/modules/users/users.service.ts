import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { createPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async findAll(page: number = 1, limit: number = 20, search?: string, role?: UserRole, status?: UserStatus) {
    const where: any = {
      role: UserRole.CUSTOMER,
    };

    if (search) {
      where.$or = [
        { name: { $ilike: `%${search}%` } },
        { email: { $ilike: `%${search}%` } },
        { phone: { $ilike: `%${search}%` } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;

    const [users, total] = await this.em.findAndCount(User, where, {
      orderBy: { createdAt: 'DESC' },
      limit,
      offset,
    });

    return createPaginatedResponse(users, page, limit, total);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.em.findOne(User, { id }, {
      populate: ['orders', 'reviews'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findOne(id);
    user.status = status;
    await this.em.flush();
    return user;
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);
    // TODO: Hash password
    user.password = newPassword;
    await this.em.flush();
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.em.removeAndFlush(user);
  }
}


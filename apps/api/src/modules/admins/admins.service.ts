import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User, UserRole } from '../../entities/user.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(private readonly em: EntityManager) {}

  async create(createDto: CreateAdminDto): Promise<User> {
    // Check email uniqueness
    const existing = await this.em.findOne(User, { email: createDto.email });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const admin = this.em.create(User, {
      ...createDto,
      password: hashedPassword,
    });

    await this.em.persistAndFlush(admin);
    return admin;
  }

  async findAll() {
    return this.em.find(User, {
      role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR, UserRole.VIEWER] },
    }, {
      orderBy: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const admin = await this.em.findOne(User, { id });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async update(id: string, updateDto: UpdateAdminDto): Promise<User> {
    const admin = await this.findOne(id);

    if (updateDto.email && updateDto.email !== admin.email) {
      const existing = await this.em.findOne(User, { email: updateDto.email });
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }

    this.em.assign(admin, updateDto);
    await this.em.flush();
    return admin;
  }

  async remove(id: string): Promise<void> {
    const admin = await this.findOne(id);
    await this.em.removeAndFlush(admin);
  }
}


import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
} from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum VoucherType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum VoucherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity()
export class Voucher {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ unique: true })
  code!: string;

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @Enum(() => VoucherType)
  type!: VoucherType;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  discount!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscount?: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minPurchase: number = 0;

  @Property({ nullable: true })
  maxUses?: number;

  @Property({ default: 0 })
  usedCount: number = 0;

  @Property({ nullable: true })
  expiryDate?: Date;

  @Enum(() => VoucherStatus)
  status: VoucherStatus = VoucherStatus.ACTIVE;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}


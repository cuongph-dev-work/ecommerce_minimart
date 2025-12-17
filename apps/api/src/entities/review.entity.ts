import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Product } from './product.entity';
import { User } from './user.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  HIDDEN = 'hidden',
}

@Entity()
export class Review {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Product)
  product!: Product;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @Property()
  userName!: string;

  @Property({ type: 'int' })
  rating!: number; // 1-5, validated in DTO

  @Property({ type: 'text', nullable: true })
  comment?: string;

  @Enum(() => ReviewStatus)
  status: ReviewStatus = ReviewStatus.PENDING;

  @Property({ type: 'text', nullable: true })
  adminResponse?: string;

  @Property({ default: 0 })
  helpful: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}


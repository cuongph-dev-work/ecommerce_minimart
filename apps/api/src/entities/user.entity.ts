import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Order } from './order.entity';
import { Review } from './review.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
}

@Entity()
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  email!: string;

  @Property()
  password!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  phone?: string;

  @Enum(() => UserRole)
  role: UserRole = UserRole.CUSTOMER;

  @Enum(() => UserStatus)
  status: UserStatus = UserStatus.ACTIVE;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => Order, (order) => order.customer)
  orders = new Collection<Order>(this);

  @OneToMany(() => Review, (review) => review.user)
  reviews = new Collection<Review>(this);
}


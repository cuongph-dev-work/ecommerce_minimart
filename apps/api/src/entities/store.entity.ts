import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  Enum,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Order } from './order.entity';

export enum StoreStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Store {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  name!: string;

  @Property()
  address!: string;

  @Property({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat?: number;

  @Property({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng?: number;

  @Property()
  phone!: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ type: 'json', nullable: true })
  workingHours?: {
    weekdays: { start: string; end: string };
    weekends: { start: string; end: string };
  };

  @Property({ type: 'array', nullable: true })
  services?: string[];

  @Property({ default: true })
  allowPickup: boolean = true;

  @Property({ nullable: true })
  preparationTime?: string;

  @Enum(() => StoreStatus)
  status: StoreStatus = StoreStatus.ACTIVE;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => Order, (order) => order.pickupStore)
  orders = new Collection<Order>(this);
}


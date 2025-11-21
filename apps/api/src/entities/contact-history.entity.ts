import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  Enum,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Order } from './order.entity';

export enum ContactType {
  CALL = 'call',
  SMS = 'sms',
  EMAIL = 'email',
  ZALO = 'zalo',
}

@Entity()
export class ContactHistory {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Order)
  order!: Order;

  @Enum(() => ContactType)
  type!: ContactType;

  @Property()
  note!: string;

  @Property()
  createdBy!: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}


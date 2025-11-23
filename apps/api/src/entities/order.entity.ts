import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Enum,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';
import { Store } from './store.entity';
import { OrderItem } from './order-item.entity';
import { ContactHistory } from './contact-history.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum PaymentMethod {
  COD = 'cod',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

@Entity()
export class Order {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ unique: true })
  orderNumber!: string;

  @ManyToOne(() => User, { nullable: true })
  customer?: User;

  @Property()
  customerName!: string;

  @Property()
  customerPhone!: string;

  @Property({ nullable: true })
  customerEmail?: string;

  @Property({ nullable: true })
  notes?: string;

  @Enum(() => OrderStatus)
  status: OrderStatus = OrderStatus.PENDING;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number = 0;

  @Enum(() => PaymentMethod)
  paymentMethod: PaymentMethod = PaymentMethod.COD;

  @Enum(() => PaymentStatus)
  paymentStatus: PaymentStatus = PaymentStatus.UNPAID;

  @ManyToOne(() => Store)
  pickupStore!: Store;

  @Property({ nullable: true })
  voucherCode?: string;

  @Property({ type: 'json', nullable: true })
  receiptImages?: string[]; // Array of receipt image URLs

  @Property({ type: 'json', nullable: true })
  statusHistory?: Array<{
    status: string;
    note: string;
    createdAt: Date;
    updatedBy: string;
  }>;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => OrderItem, (item) => item.order, { orphanRemoval: true })
  items = new Collection<OrderItem>(this);

  @OneToMany(() => ContactHistory, (contact) => contact.order)
  contactHistory = new Collection<ContactHistory>(this);
}


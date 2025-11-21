import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity()
export class OrderItem {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Order)
  order!: Order;

  @ManyToOne(() => Product)
  product!: Product;

  @Property()
  quantity!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();
}


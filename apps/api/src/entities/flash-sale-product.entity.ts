import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FlashSale } from './flash-sale.entity';
import { Product } from './product.entity';

@Entity()
export class FlashSaleProduct {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => FlashSale)
  flashSale!: FlashSale;

  @ManyToOne(() => Product)
  product!: Product;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  originalPrice!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  salePrice!: number;

  @Property({ type: 'decimal', precision: 5, scale: 2 })
  discount!: number;

  @Property()
  total!: number;

  @Property({ default: 0 })
  sold: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}


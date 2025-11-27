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
import { Category } from './category.entity';
import { OrderItem } from './order-item.entity';
import { Review } from './review.entity';
import { FlashSaleProduct } from './flash-sale-product.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

@Entity()
export class Product {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ type: 'text', nullable: true })
  specifications?: string;

  @Property({ type: 'text', nullable: true })
  usageGuide?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number = 0;

  @Property({ default: 0 })
  stock: number = 0;

  @ManyToOne(() => Category)
  category!: Category;

  @ManyToOne(() => Category, { nullable: true })
  subcategory?: Category;

  @Property({ nullable: true })
  brand?: string;

  @Property({ unique: true })
  sku!: string;

  @Property({ unique: true })
  slug!: string;

  @Property({ type: 'array' })
  images: string[] = [];

  @Enum(() => ProductStatus)
  status: ProductStatus = ProductStatus.ACTIVE;

  @Property({ default: false })
  featured: boolean = false;

  @Property({ default: false })
  isOfficial: boolean = false;

  @Property({ nullable: true })
  warrantyPeriod?: string;

  @Property({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number = 0;

  @Property({ default: 0 })
  reviewCount: number = 0;

  @Property({ default: 0 })
  soldCount: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems = new Collection<OrderItem>(this);

  @OneToMany(() => Review, (review) => review.product)
  reviews = new Collection<Review>(this);

  @OneToMany(() => FlashSaleProduct, (fsp) => fsp.product)
  flashSaleProducts = new Collection<FlashSaleProduct>(this);
}


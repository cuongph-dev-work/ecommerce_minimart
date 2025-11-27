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
import { Product } from './product.entity';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Category {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  name!: string;

  @Property({ unique: true })
  slug!: string;

  @Property({ nullable: true })
  icon?: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  image?: string;

  @ManyToOne(() => Category, { nullable: true })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children = new Collection<Category>(this);

  @Enum(() => CategoryStatus)
  status: CategoryStatus = CategoryStatus.ACTIVE;

  @Property({ default: 0 })
  sortOrder: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => Product, (product) => product.category)
  products = new Collection<Product>(this);
}


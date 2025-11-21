import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  Enum,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { FlashSaleProduct } from './flash-sale-product.entity';

export enum FlashSaleStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  ENDED = 'ended',
}

@Entity()
export class FlashSale {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  name!: string;

  @Property()
  startTime!: Date;

  @Property()
  endTime!: Date;

  @Enum(() => FlashSaleStatus)
  status: FlashSaleStatus = FlashSaleStatus.UPCOMING;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => FlashSaleProduct, (fsp) => fsp.flashSale, {
    orphanRemoval: true,
  })
  products = new Collection<FlashSaleProduct>(this);
}


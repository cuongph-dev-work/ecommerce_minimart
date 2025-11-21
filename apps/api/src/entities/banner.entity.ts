import {
  Entity,
  PrimaryKey,
  Property,
  Enum,
} from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum BannerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity()
export class Banner {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @Property()
  image!: string;

  @Property({ nullable: true })
  link?: string;

  @Enum(() => BannerStatus)
  status: BannerStatus = BannerStatus.ACTIVE;

  @Property({ default: 0 })
  sortOrder: number = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}


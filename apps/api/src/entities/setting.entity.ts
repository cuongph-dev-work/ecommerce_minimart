import {
  Entity,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

@Entity()
export class Setting {
  @PrimaryKey()
  key!: string;

  @Property({ type: 'json' })
  value!: any;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}


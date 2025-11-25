import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity()
export class SearchQuery {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ unique: true })
  query!: string; // The search keyword

  @Property({ default: 1 })
  count: number = 1; // Number of times this query was searched

  @Property({ onUpdate: () => new Date() })
  lastSearchedAt: Date = new Date();

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}


import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CategoryOrder {
  id!: string;
  sortOrder!: number;
}

export class ReorderCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrder)
  categories!: CategoryOrder[];
}


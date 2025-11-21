import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly em: EntityManager) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check slug uniqueness
    const existingSlug = await this.em.findOne(Category, { slug: createCategoryDto.slug });
    if (existingSlug) {
      throw new ConflictException('Slug already exists');
    }

    let parent: Category | undefined;
    if (createCategoryDto.parentId) {
      parent = await this.em.findOne(Category, { id: createCategoryDto.parentId });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.em.create(Category, {
      ...createCategoryDto,
      parent,
    });

    await this.em.persistAndFlush(category);
    return category;
  }

  async findAll(): Promise<Category[]> {
    // Get all categories with tree structure
    const categories = await this.em.find(
      Category,
      {},
      {
        populate: ['children', 'products'],
        orderBy: { sortOrder: 'ASC', name: 'ASC' },
      },
    );

    // Build tree structure (only root categories)
    return categories.filter((cat) => !cat.parent);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.em.findOne(
      Category,
      { id },
      {
        populate: ['parent', 'children', 'products'],
      },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Check slug uniqueness if updating
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingSlug = await this.em.findOne(Category, { slug: updateCategoryDto.slug });
      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
    }

    // Update parent if provided
    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      
      const parent = await this.em.findOne(Category, { id: updateCategoryDto.parentId });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      category.parent = parent;
    }

    this.em.assign(category, updateCategoryDto);
    await this.em.flush();

    return category;
  }

  async remove(id: string): Promise<void> {
    const category = await this.em.findOne(
      Category,
      { id },
      { populate: ['children', 'products'] },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if has children
    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    // Check if has products
    if (category.products.length > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    await this.em.removeAndFlush(category);
  }

  async reorder(categories: Array<{ id: string; sortOrder: number }>): Promise<void> {
    for (const item of categories) {
      const category = await this.em.findOne(Category, { id: item.id });
      if (category) {
        category.sortOrder = item.sortOrder;
      }
    }

    await this.em.flush();
  }
}


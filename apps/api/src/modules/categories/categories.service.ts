import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager, wrap } from '@mikro-orm/core';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(private readonly em: EntityManager) {}


  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Generate slug from name if not provided
    let slug = createCategoryDto.slug;
    if (!slug) {
      // Generate slug from name with timestamp
      slug = generateSlug(createCategoryDto.name);
      if (!slug) {
        throw new BadRequestException('Cannot generate slug from category name');
      }
    } else {
      // Use manually provided slug as-is, just validate format and check uniqueness
      if (!slug.trim()) {
        throw new BadRequestException('Slug cannot be empty');
      }
      // Check uniqueness
      const existingSlug = await this.em.findOne(Category, { slug, deletedAt: null });
      if (existingSlug) {
        throw new ConflictException('Slug already exists');
      }
      // Use slug as provided (no normalization, no timestamp)
    }

    let parent: Category | undefined;
    if (createCategoryDto.parentId) {
      parent = await this.em.findOne(Category, { id: createCategoryDto.parentId, deletedAt: null });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.em.create(Category, {
      ...createCategoryDto,
      slug,
      parent,
    });

    await this.em.persistAndFlush(category);
    return category;
  }

  async findAll(): Promise<Category[]> {
    // Get all categories with tree structure
    const categories = await this.em.find(
      Category,
      { deletedAt: null },
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
      { id, deletedAt: null },
      {
        populate: ['parent', 'children', 'products'],
      },
    );

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.em.findOne(
      Category,
      { slug, deletedAt: null },
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

    // Handle slug: generate from name if name changed, or validate if slug provided
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      // Name changed, regenerate slug from new name with timestamp
      const newSlug = generateSlug(updateCategoryDto.name);
      if (!newSlug) {
        throw new BadRequestException('Cannot generate slug from category name');
      }
      category.slug = newSlug;
    } else if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      // Slug provided manually, use as-is and check uniqueness
      if (!updateCategoryDto.slug.trim()) {
        throw new BadRequestException('Slug cannot be empty');
      }
      const existingSlug = await this.em.findOne(Category, { slug: updateCategoryDto.slug, deletedAt: null });
      if (existingSlug && existingSlug.id !== category.id) {
        throw new ConflictException('Slug already exists');
      }
      category.slug = updateCategoryDto.slug;
    } else if (!category.slug && category.name) {
      // Category has no slug, generate from existing name with timestamp
      const newSlug = generateSlug(category.name);
      if (!newSlug) {
        throw new BadRequestException('Cannot generate slug from category name');
      }
      category.slug = newSlug;
    }

    // Handle parentId separately (it's not a direct field, it's a relation)
    const { parentId, slug, ...updateData } = updateCategoryDto;
    
    // Update parent if provided
    if (parentId !== undefined) {
      if (parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      
      if (parentId === null || parentId === '') {
        // Remove parent (make it root category)
        category.parent = undefined;
      } else {
        const parent = await this.em.findOne(Category, { id: parentId, deletedAt: null });
        if (!parent) {
          throw new NotFoundException('Parent category not found');
        }
        category.parent = parent;
      }
    }

    // Assign other fields (excluding parentId)
    wrap(category).assign(updateData);
    await this.em.persistAndFlush(category);

    return category;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    category.deletedAt = new Date();
    await this.em.flush();
  }

  async reorder(categories: Array<{ id: string; sortOrder: number }>): Promise<void> {
    for (const item of categories) {
      const category = await this.em.findOne(Category, { id: item.id, deletedAt: null });
      if (category) {
        category.sortOrder = item.sortOrder;
      }
    }

    await this.em.flush();
  }

  /**
   * Get all subcategory IDs for a given parent category (recursive)
   */
  private async getAllSubcategoryIds(categoryId: string): Promise<string[]> {
    const category = await this.em.findOne(
      Category,
      { id: categoryId, deletedAt: null },
      { populate: ['children'] }
    );
    
    if (!category) {
      return [];
    }

    const subcategoryIds: string[] = [categoryId];
    
    for (const child of category.children) {
      const childSubcategories = await this.getAllSubcategoryIds(child.id);
      subcategoryIds.push(...childSubcategories);
    }

    return subcategoryIds;
  }

  /**
   * Find top parent categories by total sales (including subcategories)
   */
  async findTopBySales(limit: number = 3): Promise<Array<Category & { totalSold: number }>> {
    // Get all parent categories (no parent)
    const parentCategories = await this.em.find(
      Category,
      { parent: null, deletedAt: null },
      { populate: ['children', 'products'] }
    );

    // Calculate total soldCount for each parent category
    const categoriesWithSales = await Promise.all(
      parentCategories.map(async (category) => {
        // Get all subcategory IDs including the parent
        const allCategoryIds = await this.getAllSubcategoryIds(category.id);

        // Get all products in these categories and sum soldCount
        const products = await this.em.find('Product', {
          category: { $in: allCategoryIds },
          deletedAt: null,
        });

        const totalSold = products.reduce((sum, product: any) => {
          return sum + (product.soldCount || 0);
        }, 0);

        return {
          ...category,
          totalSold,
        };
      })
    );

    // Sort by totalSold descending and return top N
    categoriesWithSales.sort((a, b) => b.totalSold - a.totalSold);
    
    return categoriesWithSales.slice(0, limit);
  }
}


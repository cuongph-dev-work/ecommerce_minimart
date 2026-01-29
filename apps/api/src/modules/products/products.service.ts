import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { SearchQuery } from '../../entities/search-query.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { getThumbnailUrl } from '../../common/utils/image.util';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class ProductsService {
  constructor(private readonly em: EntityManager) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check SKU uniqueness
    const existingSku = await this.em.findOne(Product, { sku: createProductDto.sku, deletedAt: null });
    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    // Check category exists
    const category = await this.em.findOne(Category, { id: createProductDto.categoryId, deletedAt: null });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check subcategory exists if provided
    let subcategory: Category | undefined;
    if (createProductDto.subcategoryId) {
      subcategory = await this.em.findOne(Category, { id: createProductDto.subcategoryId, deletedAt: null });
      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }
      // Verify subcategory is a child of the main category
      if (subcategory.parent?.id !== category.id) {
        throw new BadRequestException('Subcategory must be a child of the selected category');
      }
    }

    const { categoryId: _categoryId, subcategoryId: _subcategoryId, ...productData } = createProductDto;
    
    const  slug = generateSlug(createProductDto.name);
    
    const product = this.em.create(Product, {
      ...productData,
      slug,
      category,
      subcategory,
    });

    await this.em.persistAndFlush(product);
    return product;
  }

  async findAll(query: QueryProductDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, search, category, brand, status, featured, isHidden, sortBy = 'created_at', sortOrder = 'desc' } = query;

    const where: any = { deletedAt: null };

    // Search
    if (search) {
      where.$or = [
        { name: { $ilike: `%${search}%` } },
        { sku: { $ilike: `%${search}%` } },
        { brand: { $ilike: `%${search}%` } },
      ];
      
      // Track search query (async, don't wait for it)
      this.trackSearchQuery(search.trim()).catch(err => {
        console.error('Failed to track search query:', err);
      });
    }

    // Filter by category
    if (category) {
      // Try to find category by ID or slug
      let categoryEntity: Category | null = null;
      try {
        // Try by ID first (UUID format)
        categoryEntity = await this.em.findOne(Category, { id: category, deletedAt: null });
      } catch {
        // If not found by ID, try by slug
        try {
          categoryEntity = await this.em.findOne(Category, { slug: category, deletedAt: null });
        } catch {
          // Category not found, skip filter
        }
      }

      if (categoryEntity) {
        // If category has a parent, it's a subcategory - filter by subcategory
        if (categoryEntity.parent) {
          where.subcategory = categoryEntity.id;
        } else {
          // If category has no parent, it's a parent category - filter by category
          where.category = categoryEntity.id;
        }
      }
    }

    // Filter by brand
    if (brand) {
      where.brand = brand;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by featured
    if (featured !== undefined) {
      where.featured = featured;
    }

    // Filter by isHidden
    if (isHidden !== undefined) {
      where.isHidden = isHidden;
    }

    // Sort
    const sortFieldMap: Record<string, string> = {
      created_at: 'createdAt',
      updated_at: 'updatedAt',
      sold: 'soldCount',
      name: 'name',
      price: 'price',
      rating: 'rating',
      discount: 'discount',
      review_count: 'reviewCount',
    };
    const orderByField = sortFieldMap[sortBy] ?? 'createdAt';
    const orderBy: any = { [orderByField]: sortOrder === 'asc' ? 'ASC' : 'DESC' };

    // Pagination
    const offset = (page - 1) * limit;

    const [products, total] = await this.em.findAndCount(Product, where, {
      populate: ['category', 'subcategory'],
      orderBy,
      limit,
      offset,
    });

    // Transform products to include thumbnail URLs for list view
    const transformedProducts = products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount,
        stock: product.stock,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        sku: product.sku,
        slug: product.slug,
        images: product.images, // Original images for detail view
        thumbnailUrls: product.images.map((img) => getThumbnailUrl(img)), // Thumbnail URLs for list view
        status: product.status,
        featured: product.featured,
        isOfficial: product.isOfficial,
        warrantyPeriod: product.warrantyPeriod,
        rating: product.rating,
        reviewCount: product.reviewCount,
        soldCount: product.soldCount,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

    return createPaginatedResponse(transformedProducts, page, limit, total);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.em.findOne(
      Product,
      { id, deletedAt: null },
      { populate: ['category', 'subcategory'] },
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.em.findOne(
      Product,
      { slug, deletedAt: null },
      { populate: ['category', 'subcategory'] },
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    // Check SKU uniqueness if updating
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.em.findOne(Product, { sku: updateProductDto.sku, deletedAt: null });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    // Update category if provided
    if (updateProductDto.categoryId) {
      const category = await this.em.findOne(Category, { id: updateProductDto.categoryId, deletedAt: null });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      product.category = category;
    }

    // Update subcategory if provided
    if (updateProductDto.subcategoryId !== undefined) {
      if (updateProductDto.subcategoryId === null || updateProductDto.subcategoryId === '') {
        product.subcategory = undefined;
      } else {
        const subcategory = await this.em.findOne(Category, { id: updateProductDto.subcategoryId, deletedAt: null });
        if (!subcategory) {
          throw new NotFoundException('Subcategory not found');
        }
        // Verify subcategory is a child of the main category
        if (subcategory.parent?.id !== product.category.id) {
          throw new BadRequestException('Subcategory must be a child of the selected category');
        }
        product.subcategory = subcategory;
      }
    }

    if (updateProductDto.name) {
      if (updateProductDto.name !== product.name || !product.slug) {
        product.slug = generateSlug(updateProductDto.name);
      }
    } else if (!product.slug && product.name) {
      product.slug = generateSlug(product.name);
    }

    const { categoryId: _categoryId, subcategoryId: _subcategoryId, ...updateData } = updateProductDto;
    this.em.assign(product, updateData);
    await this.em.flush();

    return product;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    product.deletedAt = new Date();
    await this.em.flush();
  }

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    const products = await this.em.find(Product, { id: { $in: ids }, deletedAt: null });

    if (products.length === 0) {
      throw new BadRequestException('No products found with provided IDs');
    }

    const now = new Date();
    products.forEach(product => {
      product.deletedAt = now;
    });
    await this.em.flush();

    return { deleted: products.length };
  }

  async export(): Promise<any> {
    // TODO: Implement export to Excel/CSV
    throw new BadRequestException('Export not implemented yet');
  }

  async import(_file: any): Promise<any> {
    // TODO: Implement import from Excel/CSV
    throw new BadRequestException('Import not implemented yet');
  }

  /**
   * Track a search query - increment count if exists, create if not
   */
  private async trackSearchQuery(query: string): Promise<void> {
    if (!query || query.trim().length < 2) {
      return; // Don't track very short queries
    }

    const normalizedQuery = query.trim().toLowerCase();
    
    try {
      let searchQuery = await this.em.findOne(SearchQuery, { query: normalizedQuery });
      
      if (searchQuery) {
        // Increment count and update lastSearchedAt
        searchQuery.count += 1;
        searchQuery.lastSearchedAt = new Date();
      } else {
        // Create new search query
        searchQuery = this.em.create(SearchQuery, {
          query: normalizedQuery,
          count: 1,
          lastSearchedAt: new Date(),
        });
      }
      
      await this.em.flush();
    } catch (error) {
      // Silently fail - don't break the main query if tracking fails
      console.error('Error tracking search query:', error);
    }
  }

  async getPopularSearches(limit: number = 5): Promise<string[]> {
    // Get top search queries by count, ordered by count desc and lastSearchedAt desc
    // Only return actual search queries from users - no fallback
    const searchQueries = await this.em.find(
      SearchQuery,
      {},
      {
        orderBy: [
          { count: 'DESC' },
          { lastSearchedAt: 'DESC' },
        ],
        limit,
      },
    );

    // Return only tracked searches - empty array if no searches yet
    return searchQueries.map(sq => sq.query);
  }
}


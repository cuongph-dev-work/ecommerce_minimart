import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Product, ProductStatus } from '../../entities/product.entity';
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

  /**
   * Generate unique slug from name
   */
  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await this.em.findOne(Product, { slug });
      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Check SKU uniqueness
    const existingSku = await this.em.findOne(Product, { sku: createProductDto.sku });
    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }

    // Check category exists
    const category = await this.em.findOne(Category, { id: createProductDto.categoryId });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check subcategory exists if provided
    let subcategory: Category | undefined;
    if (createProductDto.subcategoryId) {
      subcategory = await this.em.findOne(Category, { id: createProductDto.subcategoryId });
      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }
      // Verify subcategory is a child of the main category
      if (subcategory.parent?.id !== category.id) {
        throw new BadRequestException('Subcategory must be a child of the selected category');
      }
    }

    const { categoryId, subcategoryId, ...productData } = createProductDto;
    
    // Generate slug from name
    const baseSlug = generateSlug(createProductDto.name);
    const slug = await this.generateUniqueSlug(baseSlug);
    
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
    const { page = 1, limit = 20, search, category, brand, status, featured, sortBy = 'created_at', sortOrder = 'desc' } = query;

    const where: any = {};

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
        categoryEntity = await this.em.findOne(Category, { id: category });
      } catch {
        // If not found by ID, try by slug
        try {
          categoryEntity = await this.em.findOne(Category, { slug: category });
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

    // Sort
    let orderByField = sortBy;
    if (sortBy === 'created_at') {
      orderByField = 'createdAt';
    } else if (sortBy === 'sold') {
      orderByField = 'soldCount';
    }
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
      { id },
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
      { slug },
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
      const existingSku = await this.em.findOne(Product, { sku: updateProductDto.sku });
      if (existingSku) {
        throw new ConflictException('SKU already exists');
      }
    }

    // Update category if provided
    if (updateProductDto.categoryId) {
      const category = await this.em.findOne(Category, { id: updateProductDto.categoryId });
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
        const subcategory = await this.em.findOne(Category, { id: updateProductDto.subcategoryId });
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

    // Update slug if name changed
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const baseSlug = generateSlug(updateProductDto.name);
      product.slug = await this.generateUniqueSlug(baseSlug, product.id);
    }

    const { categoryId, subcategoryId, ...updateData } = updateProductDto;
    this.em.assign(product, updateData);
    await this.em.flush();

    return product;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    
    // Check if product has orders
    const orderItems = await this.em.find('OrderItem', { product: product.id });
    
    if (orderItems.length > 0) {
      // Product has orders, we can still delete it because OrderItem has snapshot data
      // The relationship is nullable and will be set to null on delete
      // But we keep the snapshot fields (productName, productSku, productImage, price)
    }
    
    await this.em.removeAndFlush(product);
  }

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    const products = await this.em.find(Product, { id: { $in: ids } });

    if (products.length === 0) {
      throw new BadRequestException('No products found with provided IDs');
    }

    await this.em.removeAndFlush(products);

    return { deleted: products.length };
  }

  async export(): Promise<any> {
    // TODO: Implement export to Excel/CSV
    throw new BadRequestException('Export not implemented yet');
  }

  async import(file: any): Promise<any> {
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


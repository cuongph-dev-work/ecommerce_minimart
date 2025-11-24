import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Product, ProductStatus } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { getThumbnailUrl } from '../../common/utils/image.util';

@Injectable()
export class ProductsService {
  constructor(private readonly em: EntityManager) {}

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
    const product = this.em.create(Product, {
      ...productData,
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
    }

    // Filter by category
    if (category) {
      where.category = category;
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

    const { categoryId, subcategoryId, ...updateData } = updateProductDto;
    this.em.assign(product, updateData);
    await this.em.flush();

    return product;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
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

  async getPopularSearches(limit: number = 5): Promise<string[]> {
    // Get most popular products by sold count and extract unique search terms
    const products = await this.em.find(
      Product,
      { status: ProductStatus.ACTIVE },
      {
        populate: ['category'],
        orderBy: { soldCount: 'DESC' },
        limit: limit * 3, // Get more to extract unique terms
      },
    );

    // Extract unique search terms from product names and brands
    const searchTerms = new Set<string>();
    
    products.forEach((product) => {
      // Add brand if exists
      if (product.brand) {
        searchTerms.add(product.brand);
      }
      
      // Add category name
      if (product.category?.name) {
        searchTerms.add(product.category.name);
      }
      
      // Add first 2 words from product name as potential search terms
      const words = product.name.split(' ').slice(0, 2);
      words.forEach(word => {
        if (word.length > 2) { // Only add meaningful words
          searchTerms.add(word);
        }
      });
    });

    // Convert to array and return top N
    return Array.from(searchTerms).slice(0, limit);
  }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { FlashSale } from '../../entities/flash-sale.entity';
import { FlashSaleProduct } from '../../entities/flash-sale-product.entity';
import { Product } from '../../entities/product.entity';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { AddFlashSaleProductDto } from './dto/add-product.dto';

@Injectable()
export class FlashSalesService {
  constructor(private readonly em: EntityManager) {}

  async create(createDto: CreateFlashSaleDto): Promise<FlashSale> {
    const flashSale = this.em.create(FlashSale, createDto);
    await this.em.persistAndFlush(flashSale);
    return flashSale;
  }

  async findAll() {
    return this.em.find(FlashSale, {}, {
      populate: ['products', 'products.product'],
      orderBy: { startTime: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FlashSale> {
    const flashSale = await this.em.findOne(FlashSale, { id }, {
      populate: ['products', 'products.product'],
    });

    if (!flashSale) {
      throw new NotFoundException('Flash sale not found');
    }

    return flashSale;
  }

  async update(id: string, updateDto: UpdateFlashSaleDto): Promise<FlashSale> {
    const flashSale = await this.findOne(id);
    this.em.assign(flashSale, updateDto);
    await this.em.flush();
    return flashSale;
  }

  async remove(id: string): Promise<void> {
    const flashSale = await this.findOne(id);
    await this.em.removeAndFlush(flashSale);
  }

  async addProduct(flashSaleId: string, addProductDto: AddFlashSaleProductDto) {
    const flashSale = await this.findOne(flashSaleId);
    const product = await this.em.findOne(Product, { id: addProductDto.productId });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const discount = ((addProductDto.originalPrice - addProductDto.salePrice) / addProductDto.originalPrice) * 100;

    const flashSaleProduct = this.em.create(FlashSaleProduct, {
      flashSale,
      product,
      originalPrice: addProductDto.originalPrice,
      salePrice: addProductDto.salePrice,
      discount,
      total: addProductDto.total,
    });

    await this.em.persistAndFlush(flashSaleProduct);
    return flashSaleProduct;
  }

  async updateProduct(flashSaleId: string, productId: string, updateDto: Partial<AddFlashSaleProductDto>) {
    const flashSaleProduct = await this.em.findOne(FlashSaleProduct, {
      flashSale: flashSaleId,
      product: productId,
    });

    if (!flashSaleProduct) {
      throw new NotFoundException('Flash sale product not found');
    }

    if (updateDto.originalPrice && updateDto.salePrice) {
      const discount = ((updateDto.originalPrice - updateDto.salePrice) / updateDto.originalPrice) * 100;
      updateDto['discount'] = discount;
    }

    this.em.assign(flashSaleProduct, updateDto);
    await this.em.flush();
    return flashSaleProduct;
  }

  async removeProduct(flashSaleId: string, productId: string): Promise<void> {
    const flashSaleProduct = await this.em.findOne(FlashSaleProduct, {
      flashSale: flashSaleId,
      product: productId,
    });

    if (!flashSaleProduct) {
      throw new NotFoundException('Flash sale product not found');
    }

    await this.em.removeAndFlush(flashSaleProduct);
  }
}


import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { EntityManager } from '@mikro-orm/core';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockEntityManager: Partial<EntityManager>;

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      persistAndFlush: jest.fn(),
      removeAndFlush: jest.fn(),
      flush: jest.fn(),
      assign: jest.fn(),
      findAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests here
  // Example: test create product, find product, etc.
});


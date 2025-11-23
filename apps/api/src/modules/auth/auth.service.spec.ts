import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { EntityManager } from '@mikro-orm/core';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let mockEntityManager: Partial<EntityManager>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockEntityManager = {
      findOne: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash password', async () => {
    const password = 'test123';
    const hashed = await service.hashPassword(password);
    
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(password);
  });
});


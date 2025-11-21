import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.em.findOne(User, {
      $or: [{ email: username }, { name: username }],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is locked');
    }

    // Only allow admin roles to login via admin endpoint
    const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR, UserRole.VIEWER];
    if (!adminRoles.includes(user.role)) {
      throw new UnauthorizedException('Access denied');
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}


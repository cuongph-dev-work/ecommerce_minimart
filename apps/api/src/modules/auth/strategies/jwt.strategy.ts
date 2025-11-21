import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../../entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.em.findOne(User, { id: payload.sub });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User is locked');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }
}


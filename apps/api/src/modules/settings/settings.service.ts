import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Setting } from '../../entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    const settings = await this.em.find(Setting, {});
    const result: Record<string, any> = {};
    
    settings.forEach((setting) => {
      result[setting.key] = setting.value;
    });

    return result;
  }

  async findOne(key: string): Promise<Setting> {
    const setting = await this.em.findOne(Setting, { key });

    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    return setting;
  }

  async update(key: string, value: any): Promise<Setting> {
    let setting = await this.em.findOne(Setting, { key });

    if (!setting) {
      setting = this.em.create(Setting, { key, value });
    } else {
      setting.value = value;
    }

    await this.em.persistAndFlush(setting);
    return setting;
  }
}


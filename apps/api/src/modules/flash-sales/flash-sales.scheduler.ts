import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { MikroORM } from '@mikro-orm/core';
// import { FlashSale, FlashSaleStatus } from '../../entities/flash-sale.entity';

@Injectable()
export class FlashSalesScheduler {
  private readonly logger = new Logger(FlashSalesScheduler.name);

  constructor(private readonly orm: MikroORM) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  // async updateFlashSaleStatus() {
  //   const em = this.orm.em.fork();
  //   const now = new Date();

  //   // Update to active
  //   const upcomingSales = await em.find(FlashSale, {
  //     status: FlashSaleStatus.UPCOMING,
  //     startTime: { $lte: now },
  //   });

  //   for (const sale of upcomingSales) {
  //     sale.status = FlashSaleStatus.ACTIVE;
  //     this.logger.log(`Flash sale ${sale.name} is now ACTIVE`);
  //   }

  //   // Update to ended
  //   const activeSales = await em.find(FlashSale, {
  //     status: FlashSaleStatus.ACTIVE,
  //     endTime: { $lte: now },
  //   });

  //   for (const sale of activeSales) {
  //     sale.status = FlashSaleStatus.ENDED;
  //     this.logger.log(`Flash sale ${sale.name} has ENDED`);
  //   }

  //   if (upcomingSales.length > 0 || activeSales.length > 0) {
  //     await em.flush();
  //   }
  // }
}


import { ProductService } from './../product/product.service';
import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';

@Module({
  providers: [StatisticsService, ProductService],
  controllers: [StatisticsController]
})
export class StatisticsModule {}

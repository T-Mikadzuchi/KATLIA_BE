import { ProductService } from './../product/product.service';
import { Module } from '@nestjs/common';
import { FilterService } from './filter.service';
import { FilterController } from './filter.controller';

@Module({
  providers: [FilterService, ProductService],
  controllers: [FilterController],
})
export class FilterModule {}

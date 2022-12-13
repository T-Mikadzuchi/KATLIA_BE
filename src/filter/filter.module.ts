import { Module } from '@nestjs/common';
import { FilterService } from './filter.service';
import { FilterController } from './filter.controller';

@Module({
  providers: [FilterService],
  controllers: [FilterController]
})
export class FilterModule {}

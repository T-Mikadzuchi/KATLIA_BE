import { StaffImportService } from './../staff_import.service';
import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';

@Module({
  providers: [ItemsService, StaffImportService],
  controllers: [ItemsController],
})
export class ItemsModule {}

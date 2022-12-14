import { Module } from '@nestjs/common';
import { StaffImportController } from './staff_import.controller';
import { StaffImportService } from './staff_import.service';
import { ItemsModule } from './items/items.module';

@Module({
  controllers: [StaffImportController],
  providers: [StaffImportService],
  imports: [ItemsModule],
})
export class StaffImportModule {}

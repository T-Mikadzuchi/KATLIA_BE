import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StaffModule } from './staff/staff.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [StaffModule]
})
export class AdminModule {}

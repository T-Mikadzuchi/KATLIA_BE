import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AdminService } from '../admin.service';

@Module({
  providers: [StaffService, AdminService],
  controllers: [StaffController]
})
export class StaffModule {}

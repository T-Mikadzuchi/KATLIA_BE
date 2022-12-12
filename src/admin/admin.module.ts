import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StaffModule } from './staff/staff.module';
import { UserModule } from './user/user.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [StaffModule, UserModule],
})
export class AdminModule {}

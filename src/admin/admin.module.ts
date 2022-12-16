import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StaffModule } from './staff/staff.module';
import { UserModule } from './user/user.module';
import { ImportModule } from './import/import.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [StaffModule, UserModule, ImportModule],
})
export class AdminModule {}

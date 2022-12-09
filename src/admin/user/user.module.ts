import { Module } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, AdminService]
})
export class UserModule {}

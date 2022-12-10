import { ApiTags } from '@nestjs/swagger';
import { user } from '@prisma/client';
import { GetUser } from './../auth/decorator/get-user.decorator';
import { AdminService } from './admin.service';
import { Controller } from '@nestjs/common';

@ApiTags('Admin User')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  isAdmin(@GetUser() user: user) {
    return this.adminService.isAdmin(user);
  }
}

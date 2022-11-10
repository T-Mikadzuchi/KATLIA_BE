import { user } from '@prisma/client';
import { GetUser } from './../auth/decorator/get-user.decorator';
import { AdminService } from './admin.service';
import { Controller } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  isAdmin(@GetUser() user: user) {
    return this.adminService.isAdmin(user);
  }
}

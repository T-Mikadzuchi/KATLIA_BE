import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { user } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(
        private prismaService: PrismaService,
        private adminService: AdminService,
      ) {}

    async getAllUser(user: user) {
       if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');
      
        const getuser = await this.prismaService.user.findMany();
        const userList: any[] = [];
        for (const user of getuser) {
          userList.push({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
          });
        }
        
        return userList;
        
      }

      
}

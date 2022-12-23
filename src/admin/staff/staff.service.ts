import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { user } from '@prisma/client';
import { StaffDto } from './dto';
import { AdminService } from '../admin.service';
import * as argon from 'argon2';

@Injectable()
export class StaffService {
  constructor(
    private prismaService: PrismaService,
    private adminService: AdminService,
  ) {}

  async getAllStaff(user: user) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');
    const userList = await this.prismaService.user.findMany({
      where: {
        OR: [
          {
            role: 'SALES',
          },
          {
            role: 'STORAGE',
          },
          {
            role: "ADMIN"
          }
        ],
      },
    });
    const staffList = await this.prismaService.staff.findMany();

    const List: any[] = [];
    for (const staff of staffList) {
      for (const userr of userList) {
        if (userr.id == staff.userId) {
          List.push({
            userId: userr.id,
            email: userr.email,
            fullname: userr.fullName,
            phoneNumber: userr.phoneNumber,
            role: userr.role,
            staffId: staff.id,
            startAt: staff.startAt,
            status: staff.status,
          });
        }
      }
    }
    return List;
  }

  async updateStaff(user: user, userId: string, dto: StaffDto) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');
    const updateUser = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        role: dto.role,
      },
    });
    const updateStaff = await this.prismaService.staff.update({
      where: {
        userId: userId,
      },
      data: {
        startAt: dto.startAt,
        status: dto.status,
      },
    });
    return { updateUser, updateStaff };
  }
  async addStaff(user: user, dto: StaffDto) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');
    const userr = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    const hash = await argon.hash('123456');

    if (!userr) {
      const addStaffUser = await this.prismaService.user.create({
        data: {
          email: dto.email,
          password: hash,
          role: dto.role,
        },
      });
      await this.prismaService.staff.create({
        data: {
          userId: addStaffUser.id,
          startAt: dto.startAt,
          status: 1,
        },
      });
      await this.prismaService.customer.create({
        data: {
          userId: user.id,
        },
      });
    }

    if (userr) {
      const check = await this.prismaService.staff.findUnique({
        where: {
          userId: userr.id,
        },
      });
      if (check) {
        throw new ForbiddenException('Staff existed in database');
      } else {
        await this.prismaService.user.update({
          where: {
            id: userr.id,
          },
          data: {
            role: dto.role,
          },
        });
        await this.prismaService.staff.create({
          data: {
            userId: userr.id,
            startAt: dto.startAt,
            status: 1,
          },
        });
      }
    }
    return 'Staff added';
  }
}

import { user } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StaffImportService {
  constructor(private prismaService: PrismaService) {}

  async isPermission(user: user) {
    const check = this.prismaService.staff.findFirst({
      where: {
        userId: user.id,
        status: 1,
      },
    });

    return (user.role == 'STORAGE' || user.role == 'ADMIN') && check;
  }
}

import { StaffImportService } from './../staff_import.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { user } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(
    private prismaService: PrismaService,
    private staffImportService: StaffImportService,
  ) {}

  async findStaff(userId: string) {
    const staff = await this.prismaService.staff.findUnique({
      where: {
        userId,
      },
    });
    return staff;
  }

  async findForm(id: string) {
    return await this.prismaService.storage_import.findFirst({
      where: {
        staffId: id,
      },
    });
  }

  async createImportForm(user: user) {
    if (!(await this.staffImportService.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const staff = await this.findStaff(user.id);
    let form = await this.findForm(staff.id);

    if (!form) {
      form = await this.prismaService.storage_import.create({
        data: {
          staffId: staff.id,
        },
      });
    }
    form.staffName = user.fullName;
    return form;
  }
}

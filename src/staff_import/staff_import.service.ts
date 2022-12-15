import { ItemsService } from './items/items.service';
import { user } from '@prisma/client';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImportDto } from './dto';

@Injectable()
export class StaffImportService {
  constructor(private prismaService: PrismaService) {}

  async isPermission(user: user) {
    const check = await this.prismaService.staff.findFirst({
      where: {
        userId: user.id,
        status: 1,
      },
    });

    return (user.role == 'STORAGE' || user.role == 'ADMIN') && check;
  }

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
        status: 0,
      },
    });
  }

  async getImportForm(user: user) {
    if (!(await this.isPermission(user)))
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
    const total = await this.getTotal(form);
    form.total = total;
    return form;
  }

  async getTotal(form: any) {
    let total = 0;
    const itemList = await this.prismaService.import_detail.findMany({
      where: {
        importId: form.id,
      },
    });

    for (const item of itemList) {
      total += item.unitPrice * item.quantity;
    }
    total = form.surcharge != null ? total + form.surcharge : total;

    return total;
  }

  async import(user: user, dto: ImportDto) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const form = await this.getImportForm(user);
    if (!form) throw new ForbiddenException('wtf');
    if (form.total <= 0)
      throw new ForbiddenException("You can't import blank form");

    const confirm = await this.prismaService.storage_import.update({
      where: {
        id: form.id,
      },
      data: {
        status: 1,
        staffName: form.staffName,
        date: new Date(),
        surcharge: dto.surcharge,
        total: form.total + dto.surcharge,
      },
    });
    return confirm;
  }

  async history(user: user) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    return await this.prismaService.storage_import.findMany({
      where: {
        NOT: {
          status: 0,
        },
      },
    });
  }

  async info(user: user, id: string) {
    return await this.prismaService.storage_import.findUnique({
      where: {
        id,
      },
    });
  }

  async detail(user: user, id: string) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const list: any = await this.prismaService.import_detail.findMany({
      where: {
        importId: id,
      },
    });

    for (const item of list) {
      const prod = await this.prismaService.product.findUnique({
        where: {
          productId: item.productId,
        },
      });
      const color = await this.prismaService.color.findUnique({
        where: {
          colorId: item.colorId,
        },
      });
      (item.color = color.color), (item.name = prod.name);
    }
    return list;
  }
}

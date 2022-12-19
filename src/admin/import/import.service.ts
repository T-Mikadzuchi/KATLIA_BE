import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { user } from '@prisma/client';

@Injectable()
export class ImportService {
  constructor(private prismaService: PrismaService) {}
  async isPermission(user: user) {
    return user.role == 'ADMIN';
  }
  async confirmImport(user: user, importId: string) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const storageImport = await this.prismaService.storage_import.findUnique({
      where: {
        id: importId,
      },
    });
    if (storageImport.status == 1) {
      const confirmImport = await this.prismaService.storage_import.update({
        where: {
          id: importId,
        },
        data: {
          status: 2,
        },
      });
      const importList = await this.prismaService.import_detail.findMany({
        where: {
          importId: importId,
        },
        select: {
          productId: true,
          colorId: true,
          size: true,
          quantity: true,
        },
      });
      for (const itemImport of importList) {
        const item = await this.prismaService.product_detail.findFirst({
          where: {
            productId: itemImport.productId,
            colorId: itemImport.colorId,
            size: itemImport.size,
          },
        });
        const ex_quantity = item.quantity;
        await this.prismaService.product_detail.updateMany({
          where: {
            productId: itemImport.productId,
            colorId: itemImport.colorId,
            size: itemImport.size,
          },
          data: {
            quantity: ex_quantity + itemImport.quantity,
          },
        });
      }
      return confirmImport;
    } else {
      throw new ForbiddenException("Can't confirm this import!");
    }
  }
  async cancelImport(user: user, importId: string) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const storageImport = await this.prismaService.storage_import.findUnique({
      where: {
        id: importId,
      },
    });
    if (storageImport.status == 1) {
      const cancelImport = await this.prismaService.storage_import.update({
        where: {
          id: importId,
        },
        data: {
          status: 3,
        },
      });
      return cancelImport;
    } else {
      throw new ForbiddenException("Can't cancel import");
    }
  }
}

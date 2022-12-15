import { EditItemDto } from './dto/edit-item.dto';
import { StaffImportService } from './../staff_import.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { user } from '@prisma/client';
import { ItemDto } from './dto';

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
        status: 0,
      },
    });
  }

  async getImportForm(user: user) {
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

  async addItemsIntoForm(user: user, dto: Array<ItemDto>) {
    if (!(await this.staffImportService.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const staff = await this.findStaff(user.id);
    const form = await this.findForm(staff.id);
    if (!form) return 'wtf';

    const itemList: any[] = [];

    for (const item of dto) {
      if (item.unitPrice <= 0) throw new ForbiddenException("Price can't <= 0");
      const prod = await this.prismaService.product_detail.findFirst({
        where: {
          productId: item.productId,
          colorId: item.colorId,
          size: item.size,
        },
      });
      if (!prod)
        throw new ForbiddenException(
          `Product with ID ${item.productId}, color ${item.colorId}, size ${item.size} does not exist`,
        );

      if (item.quantity == 0 || item.quantity == null) continue;
      const existed = await this.prismaService.import_detail.findFirst({
        where: {
          importId: form.id,
          productId: item.productId,
          colorId: item.colorId,
          size: item.size,
          unitPrice: item.unitPrice,
        },
      });
      if (existed) {
        const update: any = await this.prismaService.import_detail.update({
          where: {
            id: existed.id,
          },
          data: {
            quantity: existed.quantity + item.quantity,
          },
        });
        update.total = update.quantity * update.unitPrice;
        itemList.push(update);
      } else {
        const create: any = await this.prismaService.import_detail.create({
          data: {
            importId: form.id,
            productId: item.productId,
            colorId: item.colorId,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
        create.total = create.quantity * create.unitPrice;
        itemList.push(create);
      }
    }
    const total = await this.getTotal(form);

    return {
      total,
      itemList,
    };
  }

  async getProductSizeForImport(user: user, id: number) {
    if (!(await this.staffImportService.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    return await this.prismaService.product_detail.findMany({
      where: {
        productId: id,
      },
      distinct: ['size'],
      select: {
        size: true,
      },
    });
  }

  async getProductColorForImport(user: user, id: number) {
    if (!(await this.staffImportService.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const idList = await this.prismaService.product_detail.findMany({
      where: {
        productId: id,
      },
      distinct: ['colorId'],
    });

    const colorList: any[] = [];
    for (const color of idList) {
      colorList.push(
        await this.prismaService.color.findUnique({
          where: {
            colorId: color.colorId,
          },
          select: {
            color: true,
            colorId: true,
            hex: true,
          },
        }),
      );
    }

    return colorList;
  }

  async getItemsInExistingForm(user: user) {
    if (!(await this.staffImportService.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const staff = await this.findStaff(user.id);
    const form = await this.findForm(staff.id);

    if (!form) throw new ForbiddenException('No form exist');

    const itemList = await this.prismaService.import_detail.findMany({
      where: {
        importId: form.id,
      },
    });
    const result: any[] = [];
    for (const item of itemList) {
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
      result.push({
        id: item.id,
        productId: item.productId,
        name: prod.name,
        color: color.color,
        size: item.size,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.quantity * item.unitPrice,
      });
    }
    return result;
  }

  async isItemInForm(formId: string, itemId: string) {
    const check = await this.prismaService.import_detail.findFirst({
      where: {
        importId: formId,
        id: itemId,
      },
    });
    return check;
  }

  async deleteAnItem(user: user, id: string) {
    if (!(await this.staffImportService.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const staff = await this.findStaff(user.id);
    const form = await this.findForm(staff.id);

    if (!form) throw new ForbiddenException('No form exist');
    if (!(await this.isItemInForm(form.id, id)))
      throw new ForbiddenException("Can't delete this item");

    await this.prismaService.import_detail.delete({
      where: {
        id,
      },
    });
    return 'Item deleted';
  }

  async deleteAllItems(user: user) {
    if (!(await this.staffImportService.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const staff = await this.findStaff(user.id);
    const form = await this.findForm(staff.id);

    if (!form) throw new ForbiddenException('No form exist');

    await this.prismaService.import_detail.deleteMany({
      where: {
        importId: form.id,
      },
    });
    return 'All items deleted';
  }

  async editAnItem(user: user, id: string, dto: EditItemDto) {
    if (dto.quantity == 0) {
      await this.deleteAnItem(user, id);
      return 'Item deleted';
    }
    if (dto.unitPrice <= 0) throw new ForbiddenException("Price can't <=0");

    if (!(await this.staffImportService.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const staff = await this.findStaff(user.id);
    const form = await this.findForm(staff.id);

    if (!form) throw new ForbiddenException('No form exist');

    if (!(await this.isItemInForm(form.id, id)))
      throw new ForbiddenException("Can't update this item");

    const updated = await this.prismaService.import_detail.update({
      where: {
        id,
      },
      data: {
        quantity: dto.quantity,
        unitPrice: dto.unitPrice,
      },
    });
    return updated;
  }

  async getItemDetailForUpdate(user: user, id: string) {
    if (!(await this.staffImportService.isPermission(user)))
      throw new ForbiddenException('Permission denied');

    const staff = await this.findStaff(user.id);
    const form = await this.findForm(staff.id);

    if (!form) throw new ForbiddenException('No form exist');

    const itemInForm: any = await this.isItemInForm(form.id, id);
    if (!itemInForm) throw new ForbiddenException("Can't view this item");
    const prod = await this.prismaService.product.findUnique({
      where: {
        productId: itemInForm.productId
      }
    })

    const color = await this.prismaService.color.findUnique({
      where: {
        colorId: itemInForm.colorId
      }
    })

    itemInForm.color = color.color
    itemInForm.name = prod.name
    return itemInForm;
  }
}

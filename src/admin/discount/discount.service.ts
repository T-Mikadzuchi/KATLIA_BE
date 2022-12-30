import { PrismaService } from './../../prisma/prisma.service';
import { DiscountDto } from './dto/discount.dto';
import { user } from '@prisma/client';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { AdminService } from '../admin.service';

@Injectable()
export class DiscountService {
  constructor(
    private prismaService: PrismaService,
    private adminService: AdminService,
  ) {}

  async checkDiscount(dto: DiscountDto) {
    const checkDiscount = await this.prismaService.product_discount.findFirst({
      where: {
        OR: [
          {
            startAt: {
              gte: dto.startAt,
              lte: dto.endAt,
            },
          },
          {
            endAt: {
              gte: dto.startAt,
              lte: dto.endAt,
            },
          },
        ],
      },
    });
    return checkDiscount;
  }

  discountValidation(dto: DiscountDto) {
    if (dto.startAt > dto.endAt) {
      throw new ForbiddenException(
        'Invalid input, end time must be after begin',
      );
    }
    if (Date.parse(dto.startAt.toString()) <= Date.now())
      throw new ForbiddenException('Only future date accepted');

    if (dto.percent <= 0 || dto.percent >= 100)
      throw new ForbiddenException('Percent must >0 and <100');
    return;
  }

  async addNewDiscount(user: user, dto: DiscountDto) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    this.discountValidation(dto);

    const newDiscount = await this.prismaService.product_discount.create({
      data: {
        discountName: dto.discountName,
        percent: dto.percent / 100,
        startAt: dto.startAt,
        endAt: dto.endAt,
      },
    });
    return newDiscount;
  }

  async getAllDiscountList(user: user) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    const discountList = await this.prismaService.product_discount.findMany();
    const discountResult: any[] = [];
    for (const discount of discountList) {
      let status = 'current';
      let message = 'Only edit discount product list';
      if (discount.endAt < new Date()) {
        status = 'ended';
        message = "Can't edit";
      } else if (discount.startAt > new Date()) {
        status = 'upcoming';
        message = 'Can edit';
      }
      discountResult.push({
        id: discount.id,
        discountName: discount.discountName,
        percent: discount.percent * 100,
        startAt: discount.startAt,
        endAt: discount.endAt,
        status,
        message,
      });
    }
    return discountResult;
  }

  async editListProductsForDiscount(user: user, id: string, ls: number[]) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    const updated: any[] = [];

    await this.prismaService.product.updateMany({
      where: {
        discountId: id,
      },
      data: {
        discountId: null,
      },
    });

    for (const item of ls) {
      updated.push(
        await this.prismaService.product.update({
          where: {
            productId: item,
          },
          data: {
            discountId: id,
          },
        }),
      );
    }
    return updated;
  }

  async editDiscountInfo(user: user, id: string, dto: DiscountDto) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    const disc = await this.prismaService.product_discount.findUnique({
      where: {
        id,
      },
    });

    if (disc.endAt < new Date())
      throw new ForbiddenException("Can't edit ended promotion");
    if (disc.startAt < new Date())
      throw new ForbiddenException('Only edit product list');

    this.discountValidation(dto);

    return await this.prismaService.product_discount.update({
      where: {
        id,
      },
      data: {
        discountName: dto.discountName,
        percent: dto.percent / 100,
        startAt: dto.startAt,
        endAt: dto.endAt,
      },
    });
  }

  async deleteDiscount(user: user, id: string) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    const disc = await this.prismaService.product_discount.findUnique({
      where: {
        id,
      },
    });

    if (disc.startAt < new Date())
      throw new ForbiddenException("Can't delete this discount");

    await this.prismaService.product_discount.delete({
      where: {
        id,
      },
    });
    return 'Discount deleted';
  }

  async getProductsForDiscount(user: user) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');
    return await this.prismaService.product.findMany({
      where: {
        isDeleted: 0
      },
      select: {
        productId: true,
        name: true,
        price: true,
        discountId: true
      }
    })
  }
}

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

  async addNewDiscount(user: user, dto: DiscountDto) {
    if (!(await this.adminService.isAdmin(user)))
      throw new ForbiddenException('Permission denied');

    if (!dto.discountName || !dto.percent || !dto.endAt || !dto.startAt)
      throw new ForbiddenException('Missing required parameters');

    if (dto.startAt > dto.endAt) {
      throw new ForbiddenException(
        'Invalid input, end time must be after begin',
      );
    }
    if (Date.parse(dto.startAt.toString()) <= Date.now())
      throw new ForbiddenException('Only add future discount');

    // const checkDiscount = await this.checkDiscount(dto);
    // if (checkDiscount)
    //   throw new ForbiddenException('Discount exist during the input time');

    const newDiscount = await this.prismaService.product_discount.create({
      data: {
        discountName: dto.discountName,
        percent: dto.percent,
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
        percent: discount.percent,
        startAt: discount.startAt,
        endAt: discount.endAt,
        status,
        message,
      });
    }
    return discountResult;
  }
}

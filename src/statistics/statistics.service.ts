import { Injectable, ForbiddenException } from '@nestjs/common';
import { user } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductService } from 'src/product/product.service';
@Injectable()
export class StatisticsService {
  constructor(
    private prismaSerVice: PrismaService,
    private productService: ProductService,
  ) {}
  async isPermission(user: user) {
    return user.role == 'ADMIN';
  }
  async statisticsUser(user: user) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const count_user = await this.prismaSerVice.user.count({
      where: {
        role: 'CUSTOMER',
      },
    });
    return count_user;
  }

  async newOrderOfMonth(user: user) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const today = new Date();
    const firstDayMonth = new Date(today.setDate(1));
    firstDayMonth.setHours(0, 0, 0, 0);
    const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    lastDayMonth.setHours(0, 0, 0, 0);
    const countOrder = await this.prismaSerVice.order_detail.count({
      where: {
        status: 4,
        completedAt: {
          lt: new Date(lastDayMonth),
          gte: new Date(firstDayMonth),
        },
      },
    });

    return countOrder;
  }

  async orderPercentGrowth(user: user) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const today = new Date();
    const firstDayMonth = new Date(today.setDate(1));
    firstDayMonth.setHours(0, 0, 0, 0);
    const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    lastDayMonth.setHours(0, 0, 0, 0);
    const monthOrder = await this.prismaSerVice.order_detail.count({
      where: {
        status: 4,
        completedAt: {
          lt: new Date(lastDayMonth),
          gte: new Date(firstDayMonth),
        },
      },
    });
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    const firstDayLastMonth = new Date(d);
    firstDayLastMonth.setHours(0, 0, 0, 0);
    const lastDayLastMonth = new Date(today.setDate(1));
    lastDayLastMonth.setHours(0, 0, 0, 0);
    const lastMonthOrder = await this.prismaSerVice.order_detail.count({
      where: {
        status: 4,
        completedAt: {
          lt: new Date(lastDayLastMonth),
          gte: new Date(firstDayLastMonth),
        },
      },
    });
    const percent = (await (monthOrder / lastMonthOrder - 1)) * 100;
    return this.productService.formatFloat(percent);
  }

  async importOfMonth() {
    const today = new Date();
    const firstDayMonth = new Date(today.setDate(1));
    firstDayMonth.setHours(0, 0, 0, 0);
    const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    lastDayMonth.setHours(0, 0, 0, 0);
    const importList = await this.prismaSerVice.storage_import.findMany({
      where: {
        status: 2,
        date: {
          lt: new Date(lastDayMonth),
          gte: new Date(firstDayMonth),
        },
      },
    });
    let importOfMonth = 0;
    for (const ip of importList) {
      importOfMonth += ip.total;
    }

    return this.productService.formatFloat(importOfMonth);
  }

  async revenueOfMonth(user: user) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const today = new Date();
    const firstDayMonth = new Date(today.setDate(1));
    firstDayMonth.setHours(0, 0, 0, 0);
    const lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    lastDayMonth.setHours(0, 0, 0, 0);
    const incomeList = await this.prismaSerVice.order_detail.findMany({
      where: {
        status: 4,
        completedAt: {
          lt: new Date(lastDayMonth),
          gte: new Date(firstDayMonth),
        },
      },
    });
    let revenueOfMonth = 0;
    for (const ic of incomeList) {
      revenueOfMonth += ic.total;
      revenueOfMonth -= ic.shippingFee;
    }

    return this.productService.formatFloat(revenueOfMonth);
  }

  async revenueOfLastMonth(user: user) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const today = new Date();
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    const firstDayLastMonth = new Date(d);
    firstDayLastMonth.setHours(0, 0, 0, 0);
    const lastDayLastMonth = new Date(today.setDate(1));
    lastDayLastMonth.setHours(0, 0, 0, 0);
    const incomeList = await this.prismaSerVice.order_detail.findMany({
      where: {
        status: 4,
        completedAt: {
          lt: new Date(lastDayLastMonth),
          gte: new Date(firstDayLastMonth),
        },
      },
    });
    let revenueOfLastMonth = 0;
    for (const ic of incomeList) {
      revenueOfLastMonth += ic.total;
      revenueOfLastMonth -= ic.shippingFee;
    }

    return this.productService.formatFloat(revenueOfLastMonth);
  }

  async revenuePercentGrowth(user: user) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const revenue = await this.revenueOfMonth(user);
    const last_revenue = await this.revenueOfLastMonth(user);
    return this.productService.formatFloat((revenue / last_revenue - 1) * 100);
  }

  async orderPerMonth(user: user, year: number) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const array = new Array(12);
    for (let i = 0; i < 12; i++) {
      const firstday = new Date(year, i, 1);
      const lastday = new Date(year, i + 1, 1);
      array[i] = await this.prismaSerVice.order_detail.count({
        where: {
          status: 4,
          completedAt: {
            lt: lastday,
            gte: firstday,
          },
        },
      });
    }
    return array;
  }

  async revenuePerMonth(user: user, year: number) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const array = new Array(12);
    for (let i = 0; i < 12; i++) {
      array[i] = 0;
      const firstday = new Date(year, i, 1);
      const lastday = new Date(year, i + 1, 1);
      const revenueList = await this.prismaSerVice.order_detail.findMany({
        where: {
          status: 4,
          completedAt: {
            lt: lastday,
            gte: firstday,
          },
        },
      });
      for (const ic of revenueList) {
        array[i] += ic.total;
        array[i] -= ic.shippingFee;
      }
    }
    return array;
  }
  async ratio(user: user) {
    if (!(await this.isPermission(user)))
      throw new ForbiddenException('Permission denied');
    const expenditure = await this.importOfMonth();
    const revenue = await this.revenueOfMonth(user);
    return (revenue / (revenue + expenditure)) * 100;
  }
}

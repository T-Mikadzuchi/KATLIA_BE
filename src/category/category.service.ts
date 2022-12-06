import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}
  getCategoryByGender(gender: string) {
    const categoryList = this.prismaService.product_category.findMany({
      where: {
        gender: gender,
      },
      select: {
        category: true,
        categoryId: true,
        gender: true
      },
    });
    return categoryList;
  }

  async getAll() {
    const men = await this.getCategoryByGender('men');
    const women = await this.getCategoryByGender('women');
    const list: any[] = []
    for (const man of men) {
      list.push(man)
    }
    for (const woman of women) {
      list.push(woman)
    }
    return list
  }
}

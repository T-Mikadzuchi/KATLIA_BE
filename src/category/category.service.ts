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
    });
    return categoryList;
  }
}

import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}
  async displayProductListByCategory(category: any, productList: any) {
    const findProduct = await this.prismaService.product.findMany({
      where: {
        categoryId: category.categoryId,
      },
      select: {
        productId: true,
        name: true,
        price: true,
        discountId: true,
      },
    });
    for (const product of findProduct) {
      const productColor = await this.prismaService.product_detail.groupBy({
        by: ['productId', 'colorId'],
        where: {
          productId: product.productId,
        },
      });
      productList.push({
        id: product.productId,
        name: product.name,
        colorNumber: productColor.length,
        price: product.price,
        discountId: product.discountId,
      });
    }
  }

  async getProductByGender(gender: string) {
    const categoryList = await this.prismaService.product_category.findMany({
      where: {
        gender: gender
      },
      select: {
        categoryId: true,
      },
    });
    const productList: {
      id: number;
      name: string;
      colorNumber: number;
      price: number;
      discountId: string;
    }[] = [];
    for (const category of categoryList) {
      await this.displayProductListByCategory(category, productList)
    }
    return productList;
  }

  async getProductByCategoryId(categoryId: number) {
    const category = await this.prismaService
    const productList: any[] = []
    await this.displayProductListByCategory(categoryId, productList)
    console.log(productList.length)
    return productList
  }
}

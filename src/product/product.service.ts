import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}
  async displayProductListByCategory(categoryId: number, productList: any) {
    const findProduct = await this.prismaService.product.findMany({
      where: {
        categoryId,
      },
      select: {
        productId: true,
        name: true,
        price: true,
        discountId: true,
        sold: true,
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
        sold: product.sold,
      });
    }
  }

  async getProductByGender(gender: string) {
    const categoryList = await this.prismaService.product_category.findMany({
      where: {
        gender: gender,
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
      sold: number;
    }[] = [];
    for (const category of categoryList) {
      const categoryId = category.categoryId
      await this.displayProductListByCategory(categoryId, productList);
    }
    return productList;
  }

  async getProductByCategoryId(categoryId: number) {
    const productList: any[] = [];
    await this.displayProductListByCategory(categoryId, productList);
    return productList;
  }

  async getTop4(gender: string) {
    const products = await this.getProductByGender(gender);
    const top4 = await products
      .sort((a, b) => {
        return b.sold - a.sold;
      })
      .slice(0, 4);
    return top4;
  }
}

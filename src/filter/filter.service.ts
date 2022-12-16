import { ProductService } from './../product/product.service';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { product } from '@prisma/client';

@Injectable()
export class FilterService {
  constructor(
    private prismaService: PrismaService,
    private productService: ProductService,
  ) {}
  getAllColors() {
    return this.prismaService.color.findMany({
      select: {
        color: true,
        colorId: true,
        hex: true,
      },
    });
  }

  async getAllSizes() {
    return this.prismaService.product_detail.findMany({
      distinct: ['size'],
      select: {
        size: true,
      },
    });
  }

  async searchProducts(search: string) {
    const result = await this.prismaService.product.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    });

    const productList: any[] = [];
    await this.productService.customProductList(result, productList);
    return productList;
  }

  async findFromResult(result: any, products: product[]) {
    for (const item of result) {
      products.push(
        await this.prismaService.product.findUnique({
          where: {
            productId: item.productId,
          },
        }),
      );
    }
  }

  async filterByColor(colorId: number) {
    const result = await this.prismaService.product_detail.findMany({
      where: {
        colorId,
      },
      distinct: ['colorId', 'productId'],
      select: {
        productId: true,
      },
    });

    const products: product[] = [];
    await this.findFromResult(result, products);

    const productList: any[] = [];
    await this.productService.customProductList(products, productList);
    return productList;
  }

  async filterBySize(size: string) {
    const result = await this.prismaService.product_detail.findMany({
      where: {
        size: {
          equals: size,
          mode: 'insensitive',
        },
        quantity: {
          not: 0,
        },
      },
      distinct: ['size', 'productId'],
      select: {
        productId: true,
      },
    });

    const products: product[] = [];
    await this.findFromResult(result, products);

    const productList: any[] = [];
    await this.productService.customProductList(products, productList);
    return productList;
  }

  async filterByColorAndSize(colorId: number, size: string) {
    const result = await this.prismaService.product_detail.findMany({
      where: {
        size: {
          equals: size,
          mode: 'insensitive',
        },
        colorId,
        quantity: {
          not: 0,
        },
      },
      select: {
        productId: true,
      },
    });

    const products: product[] = [];
    await this.findFromResult(result, products);

    const productList: any[] = [];
    await this.productService.customProductList(products, productList);
    return productList;
  }
}

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

  async filterGender(gender: string, products: any[], firstResult: any[]) {
    const cate = await this.prismaService.product_category.findMany({
      where: {
        gender,
      },
    });
    for (const result of firstResult) {
      for (const c of cate) {
        if (result.categoryId == c.categoryId) {
          products.push(result);
          break;
        }
      }
    }
  }

  async filterCategory(
    categoryId: number,
    products: any[],
    firstResult: any[],
  ) {
    for (const result of firstResult) {
      if (result.categoryId == categoryId) {
        products.push(result);
        break;
      }
    }
  }

  async filterColorByGender(colorId: number, gender: string) {
    const firstResult = await this.filterByColor(colorId);
    const products: any[] = [];
    await this.filterGender(gender, products, firstResult);
    return products;
  }

  async filterColorByCategoryId(colorId: number, categoryId: number) {
    const firstResult = await this.filterByColor(colorId);
    const products: any[] = [];
    this.filterCategory(categoryId, products, firstResult);
    return products;
  }

  async filterSizeByGender(size: string, gender: string) {
    const firstResult = await this.filterBySize(size);
    const products: any[] = [];
    await this.filterGender(gender, products, firstResult);
    return products;
  }

  async filterSizeByCategoryId(size: string, categoryId: number) {
    const firstResult = await this.filterBySize(size);
    const products: any[] = [];
    this.filterCategory(categoryId, products, firstResult);
    return products;
  }

  async filterSizeColorByGender(colorId: number, size: string, gender: string) {
    const firstResult = await this.filterByColorAndSize(colorId, size);
    const products: any[] = [];
    await this.filterGender(gender, products, firstResult);
    return products;
  }

  async filterSizeColorByCategoryId(
    colorId: number,
    size: string,
    categoryId: number,
  ) {
    const firstResult = await this.filterByColorAndSize(colorId, size);
    const products: any[] = [];
    this.filterCategory(categoryId, products, firstResult);
    return products;
  }
}

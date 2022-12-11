import { PrismaService } from './../prisma/prisma.service';
import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}
  async getProductColors(productId: number) {
    const productColor = await this.prismaService.product_detail.groupBy({
      by: ['productId', 'colorId'],
      where: {
        productId,
      },
    });
    await this.prismaService.product.update({
      where: {
        productId: productId,
      },
      data: {
        colorNumber: productColor.length,
      },
    });
    return productColor;
  }

  async setSalePrice(product: any) {
    let salePrice: number = null;
    if (product.discountId) {
      const discount = await this.prismaService.product_discount.findFirst({
        where: {
          id: product.discountId,
          startAt: {
            lte: new Date(),
          },
          endAt: {
            gte: new Date(),
          },
        },
      });
      if (discount) salePrice = product.price * (1 - discount.percent);
    }
    return salePrice;
  }

  async displayProductListByCategory(categoryId: number, productList: any) {
    const findProduct = await this.prismaService.product.findMany({
      where: {
        categoryId,
        isDeleted: 0,
      },
      select: {
        productId: true,
        name: true,
        price: true,
        sold: true,
        defaultPic: true,
        colorNumber: true,
      },
    });
    for (const product of findProduct) {
      productList.push({
        id: product.productId,
        name: product.name,
        colorNumber: product.colorNumber,
        price: product.price,
        sold: product.sold,
        salePrice: await this.setSalePrice(product),
        image: product.defaultPic,
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
    const productList: any[] = [];
    for (const category of categoryList) {
      const categoryId = category.categoryId;
      await this.displayProductListByCategory(categoryId, productList);
    }

    console.log(productList.length);
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

  async getProductDetail(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: {
        productId: id,
      },
    });
    if (!product) {
      throw new ForbiddenException('Product does not exist');
    }

    const productColors = await this.getProductColors(product.productId);

    const colorList: any[] = [];
    for (const prodColor of productColors) {
      const color = await this.prismaService.color.findUnique({
        where: {
          colorId: prodColor.colorId,
        },
      });

      const details: any[] = [];
      const productDetail = await this.prismaService.product_detail.findMany({
        where: {
          productId: prodColor.productId,
          colorId: prodColor.colorId,
        },
      });
      for (const detail of productDetail) {
        details.push({
          size: detail.size,
          quantity: detail.quantity,
        });
      }

      const imgList: any[] = [];
      const images = await this.prismaService.image.findMany({
        where: {
          productId: prodColor.productId,
          colorId: prodColor.colorId,
        },
      });
      for (const image of images) {
        let url: string = null;
        if (image.url.startsWith('//')) url = 'https:' + image.url;
        else url = image.url;
        imgList.push({
          url,
        });
      }

      colorList.push({
        id: color.colorId,
        name: color.color,
        hex: color.hex,
        imgList,
        details,
      });
    }

    const salePrice = await this.setSalePrice(product);
    return {
      id,
      name: product.name,
      price: product.price,
      salePrice,
      description: product.description,
      colorList,
    };
  }

  async get4SimilarItems(id: number) {
    const selected = await this.prismaService.product.findUnique({
      where: {
        productId: id,
      },
    });
    if (!selected) {
      throw new ForbiddenException('Product does not exist');
    }

    const findProduct = await this.prismaService.product.findMany({
      where: {
        categoryId: selected.categoryId,
        isDeleted: 0,
      },
      take: 4,
    });
    const productList: any[] = [];
    for (const product of findProduct) {
      const productColor = await this.getProductColors(product.productId);
      productList.push({
        id: product.productId,
        name: product.name,
        colorNumber: productColor.length,
        price: product.price,
        discountId: product.discountId,
        sold: product.sold,
        image: product.defaultPic,
      });
    }
    return productList;
  }
}

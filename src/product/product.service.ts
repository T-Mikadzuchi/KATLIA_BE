import { PrismaService } from './../prisma/prisma.service';
import { Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}
  formatFloat(num: number) {
    return parseFloat((Math.round(num * 100) / 100).toFixed(2));
  }

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
    return salePrice == null ? null : this.formatFloat(salePrice);
  }

  async includeDeletedByCategory(categoryId: number, productList: any) {
    const findProduct = await this.prismaService.product.findMany({
      where: {
        categoryId,
      },
    });

    await this.customProductListForDeleted(findProduct, productList);
  }

  async customProductList(findProduct: any, productList: any) {
    for (const product of findProduct) {
      if (!product) continue;
      if (product.isDeleted !== 0) {
        console.log(product);
        continue;
      }
      productList.push({
        id: product.productId,
        name: product.name,
        colorNumber: product.colorNumber,
        price: this.formatFloat(product.price),
        sold: product.sold,
        salePrice: await this.setSalePrice(product),
        image: product.defaultPic,
        categoryId: product.categoryId,
      });
    }
  }

  async customProductListForDeleted(findProduct: any, productList: any) {
    for (const product of findProduct) {
      productList.push({
        id: product.productId,
        name: product.name,
        colorNumber: product.colorNumber,
        price: this.formatFloat(product.price),
        sold: product.sold,
        salePrice: await this.setSalePrice(product),
        image: product.defaultPic,
        isDeleted: product.isDeleted,
      });
    }
  }

  async displayProductListByCategory(categoryId: number, productList: any) {
    const findProduct = await this.prismaService.product.findMany({
      where: {
        categoryId,
        isDeleted: 0,
      },
    });
    await this.customProductList(findProduct, productList);
  }

  async getProductByGender(gender: string) {
    const categoryList = await this.prismaService.product_category.findMany({
      where: {
        gender: {
          equals: gender,
          mode: 'insensitive',
        },
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

  async includeDeletedByCategoryId(categoryId: number) {
    const productList: any[] = [];
    await this.includeDeletedByCategory(categoryId, productList);
    return productList;
  }

  async getTop4(gender: string) {
    const products = await this.getProductByGender(gender);
    const top4 = products
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
    if (product.isDeleted != 0)
      throw new ForbiddenException('This product is deleted');

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
          id: image.id,
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
      price: this.formatFloat(product.price),
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

    await this.customProductList(findProduct, productList);

    return productList;
  }

  async getSaleProduct(list: any) {
    const result: any[] = [];
    for (const prod of list) {
      if (prod.salePrice != null) result.push(prod);
    }

    return result;
  }

  async getSaleProductByGender(gender: string) {
    const list = await this.getProductByGender(gender);
    return await this.getSaleProduct(list);
  }

  async getSaleProductByCategoryId(categoryId: number) {
    const list = await this.getProductByCategoryId(categoryId);
    return await this.getSaleProduct(list);
  }

  async getFeedbacksForProduct(id: number) {
    const feedbacks: any[] = await this.prismaService.feedback.findMany({
      where: {
        productId: id,
      },
    });

    const overall = await this.prismaService.feedback.aggregate({
      where: {
        productId: id,
      },
      _avg: {
        rate: true,
      },
      _count: true,
    });
    overall._avg.rate = this.formatFloat(overall._avg.rate);

    let rate1 = 0;
    let rate2 = 0;
    let rate3 = 0;
    let rate4 = 0;
    let rate5 = 0;
    let withCmt = 0;
    let withMedia = 0;
    for (const feedback of feedbacks) {
      const ord = await this.prismaService.order_detail.findUnique({
        where: { id: feedback.orderId },
      });
      const cus = await this.prismaService.customer.findUnique({
        where: { id: ord.customerId },
      });
      const user = await this.prismaService.user.findUnique({
        where: { id: cus.userId },
      });
      feedback.ava = user.ava;

      switch (feedback.rate) {
        case 1:
          rate1++;
          break;
        case 2:
          rate2++;
          break;
        case 3:
          rate3++;
          break;
        case 4:
          rate4++;
          break;
        case 5:
          rate5++;
          break;
      }
      if (feedback.comment) withCmt++;
      if (feedback.photo) withMedia++;
    }

    return {
      overall,
      rate1,
      rate2,
      rate3,
      rate4,
      rate5,
      withCmt,
      withMedia,
      feedbacks,
    };
  }
}

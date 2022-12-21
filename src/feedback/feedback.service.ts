import { FeedbackDto } from './dto/feedback.dto';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { user, product } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(private prismaService: PrismaService) {}

  async feedbackValidation(user: user, id: string) {
    const cus = await this.prismaService.customer.findUniqueOrThrow({
      where: {
        userId: user.id,
      },
    });

    const checkOrder = await this.prismaService.order_detail.findFirst({
      where: {
        customerId: cus.id,
        id,
        status: 4,
      },
    });
    if (!checkOrder)
      throw new ForbiddenException("You can't feedback this order");

    const checkFeedback = await this.prismaService.feedback.findFirst({
      where: {
        orderId: id,
      },
    });
    if (checkFeedback)
      throw new ForbiddenException("You've rate these products");
  }

  async getProductsForFeedback(user: user, id: string) {
    await this.feedbackValidation(user, id);

    const items = await this.prismaService.order_item.findMany({
      where: {
        orderId: id,
      },
      distinct: ['orderId', 'productId'],
    });

    const products: any[] = [];
    for (const item of items) {
      const prod = await this.prismaService.product.findUnique({
        where: {
          productId: item.productId,
        },
      });
      products.push({
        productId: prod.productId,
        name: prod.name,
        image: prod.defaultPic,
      });
    }
    return products;
  }

  async writeFeedback(user: user, id: string, array: FeedbackDto[]) {
    await this.feedbackValidation(user, id);
    for (const dto of array) {
      if (dto.rate < 1 || dto.rate > 5)
        throw new ForbiddenException('WTF rate from 1 to 5 pls');
      const prod = await this.prismaService.product.findUnique({
        where: {
          productId: dto.productId,
        },
      });
      if (!prod) throw new ForbiddenException("Product's not exist");
    }

    const feedbacks: any[] = [];

    for (const dto of array) {
      const name = user.email.split('@')[0];
      const username = dto.hideUsername
        ? name[0] + '*****' + name[name.length - 1]
        : name;

      feedbacks.push(
        await this.prismaService.feedback.create({
          data: {
            orderId: id,
            productId: dto.productId,
            username,
            rate: dto.rate,
            comment: dto.comment,
            date: new Date(),
          },
        }),
      );
    }
    return feedbacks;
  }

  async upImageForFeedback(
    user: user,
    orderId: string,
    productId: number,
    photo: string,
  ) {
    const find = await this.prismaService.feedback.findFirst({
      where: {
        orderId,
        productId,
      },
    });
    if (!find) throw new ForbiddenException('A feedback in db is required');

    const update = await this.prismaService.feedback.update({
      where: {
        id: find.id,
      },
      data: {
        photo,
      },
    });
    return update;
  }
}

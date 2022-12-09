import { MailerService } from '@nestjs-modules/mailer';
import { ProductService } from './../product/product.service';
import { CartService } from './../cart/cart.service';
import { OrderDto } from './dto/order.dto';
import { user } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderService {
  constructor(
    private prismaService: PrismaService,
    private cartService: CartService,
    private config: ConfigService,
    private productService: ProductService,
    private mailerService: MailerService,
  ) {}

  /*async getItemsAndUpdateQuantity(user: user, cartId: string) {
    const cartItems = await this.prismaService.order_item.findMany({
      where: {
        orderId: cartId,
      },
    });

    const itemList: any[] = [];
    const products: any[] = [];
    let message = '';
    for (const cartItem of cartItems) {
      const item = await this.prismaService.product_detail.findFirst({
        where: {
          productId: cartItem.productId,
          colorId: cartItem.colorId,
          size: cartItem.size,
        },
      });
      if (cartItem.quantity > item.quantity) {
        if (item.quantity == 0) {
          throw new ForbiddenException(
            `Item ${item.productId} color ${item.colorId} size ${item.size} has been out of stock, pls back to your cart`,
          );
        } else {
          await this.prismaService.order_item.update({
            where: {
              id: cartItem.id,
            },
            data: {
              quantity: item.quantity,
            },
          });
          throw new ForbiddenException(
            `Item ${item.productId} color ${item.colorId} size ${item.size} has reached its maximum quantity, pls back to your cart`,
          );
        }
      } else {
        products.push(item);
        message = 'ok';
      }
      const product = await this.prismaService.product.findUnique({
        where: {
          productId: cartItem.productId,
        },
      });

      const salePrice = await this.productService.setSalePrice(product);

      const color = await this.prismaService.color.findUnique({
        where: {
          colorId: cartItem.colorId,
        },
      });

      itemList.push({
        id: cartItem.id,
        message,
        productId: cartItem.productId,
        image: product.defaultPic,
        name: product.name + ' - ' + color.color + ' - ' + cartItem.size,
        unit: product.price,
        unitSale: salePrice,
        quantity: cartItem.quantity,
        total: product.price * cartItem.quantity,
        totalSale: salePrice != null ? salePrice * cartItem.quantity : null,
      });
    }

    //update product quantity
    for (const product of products) {
      for (const item of cartItems) {
        if (
          item.productId == product.productId &&
          item.colorId == product.colorId &&
          item.size == product.size
        ) {
          await this.prismaService.product_detail.update({
            where: {
              id: product.id,
            },
            data: {
              quantity: product.quantity - item.quantity,
            },
          });
          break;
        }
      }
    }

    for (const item of itemList) {
      for (const cartItem of cartItems) {
        if (cartItem.id == item.id) {
          await this.prismaService.order_item.update({
            where: {
              id: item.id,
            },
            data: {
              currentPrice: item.unit,
              currentSalesPrice: item.unitSale,
            },
          });
        }
      }
    }
    return itemList;
  }

  async getOrder(user: user) {
    const cart = await this.cartService.findCart(user);
    if (!cart) throw new ForbiddenException('No cart');

    const cartItems = await this.getItemsAndUpdateQuantity(user, cart.id);
    if (cartItems.length < 1)
      throw new ForbiddenException("You can't order empty cart");
    let count = 0;
    let subtotal = 0;
    let afterSale = 0;
    for (const item of cartItems) {
      count += item.quantity;
      subtotal += item.total;
      afterSale += item.totalSale != null ? item.totalSale : item.total;
    }
    const discount = afterSale == 0 ? 0 : subtotal - afterSale;
    const ship = this.cartService.setShippingFee(count);
    return {
      id: cart.id,
      cartItems,
      subtotal,
      discount,
      subtotalOnDiscount: subtotal - discount,
      ship,
      total: subtotal - discount + ship,
    };
  }

  async purchase(user: user, dto: OrderDto) {
    const order = await this.getOrder(user);
    const payment = await this.prismaService.payment.create({
      data: {
        method: dto.payment == 0 ? 'COD' : dto.payment == 1 ? 'CARD' : 'PAYPAL',
        status: dto.payment == 0 ? 0 : 1,
      },
    });
    const placed = await this.prismaService.order_detail.update({
      where: {
        id: order.id,
      },
      data: {
        receiverName: dto.receiverName,
        receiverPhone: dto.receiverPhone,
        address: dto.address,
        paymentId: payment.id,
        shippingFee: order.ship,
        total: order.total,
        note: dto.note,
        createdAt: new Date(),
        status: 'PLACED',
      },
    });
    await this.mailerService.sendMail({
      to: user.email,
      from: this.config.get('MAIL_FROM'),
      subject: 'Order confirmation from Katlia Fashion',
      text: `Thanks for your order, ${placed.receiverName}. You can see your order status on the website. Order ID: ${placed.id}`,
    });
    return placed;
  }

  async history(user: user) {
    const cus = await this.prismaService.customer.findUnique({
      where: {
        userId: user.id,
      },
    });

    const orders = await this.prismaService.order_detail.findMany({
      where: {
        customerId: cus.id,
        status: {
          not: 'CART',
        },
      },
    });

    const ordList: any[] = [];
    for (const order of orders) {
      const items = await this.prismaService.order_item.aggregate({
        where: {
          orderId: order.id,
        },
        _sum: {
          quantity: true,
        },
      });
      ordList.push({
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        numberOfItems: items._sum.quantity,
        total: order.total,
      });
    }

    return ordList;
  }

  async detail(user: user, id: string) {
    const ord = await this.prismaService.order_detail.findUnique({
      where: {
        id,
      },
    });

    const numberOfItems = await this.prismaService.order_item.aggregate({
      where: {
        orderId: id,
      },
      _sum: {
        quantity: true,
      },
    });
    const items = await this.prismaService.order_item.findMany({
      where: {
        orderId: id,
      },
    });

    const itemList: any[] = [];
    for (const item of items) {
      const color = await this.prismaService.color.findUnique({
        where: {
          colorId: item.colorId,
        },
      });
      const product = await this.prismaService.product.findUnique({
        where: {
          productId: item.productId,
        },
      });
      itemList.push({
        id: item.id,
        productId: item.productId,
        image: product.defaultPic,
        name: product.name + ' - ' + color.color + ' - ' + item.size,
        price: item.currentPrice,
        salePrice: item.currentSalesPrice,
        quantity: item.quantity,
        total: item.currentPrice * item.quantity,
        totalSale:
          item.currentSalesPrice != null
            ? item.currentSalesPrice * item.quantity
            : null,
      });
    }

    return {
      order: ord,
      numberOfItems: numberOfItems._sum.quantity,
      itemList,
    };
  }*/
}

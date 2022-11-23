import { ProductService } from './../product/product.service';
import { CartService } from './../cart/cart.service';
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, CartService, ProductService]
})
export class OrderModule {}

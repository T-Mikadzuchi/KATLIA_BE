import { ProductService } from './../product/product.service';
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService, ProductService],
})
export class CartModule {}

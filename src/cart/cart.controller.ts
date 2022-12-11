import { CartService } from './cart.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { CartDto } from './dto/cart.dto';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('addItemToCart')
  addItemToCart(@GetUser() user: user, @Body() dto: CartDto) {
    return this.cartService.addItemToCart(user, dto);
  }

  @Get('getCart')
  getCart(@GetUser() user: user) {
    return this.cartService.getCart(user);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Là id của cái cart item, ko phải product',
  })
  @Delete('deleteCartItem/:id')
  deleteCartItem(@GetUser() user: user, @Param('id') id: string) {
    if (!id) return new ForbiddenException("Pls enter cart item's id");
    return this.cartService.deleteCartItem(user, id);
  }

  @Patch('updateCartItem')
  @ApiBody({
    schema: {
      properties: {
        id: { type: 'string' },
        number: { type: 'number' },
      },
    },
  })
  updateCartItem(@GetUser() user: user, @Body() dto: any) {
    if (!dto.id) return new ForbiddenException("Pls enter cart item's id");
    return this.cartService.updateCartItem(user, dto.id, dto.number);
  }
}

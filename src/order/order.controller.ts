import { OrderDto } from './dto/order.dto';
import { user } from '@prisma/client';
import { OrderService } from './order.service';
import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Put('purchase')
  purchase(@GetUser() user: user, @Body() dto: OrderDto) {
    return this.orderService.purchase(user, dto)
  }
}

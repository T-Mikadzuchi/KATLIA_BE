import { OrderDto } from './dto/order.dto';
import { user } from '@prisma/client';
import { OrderService } from './order.service';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Put('purchase')
  purchase(@GetUser() user: user, @Body() dto: OrderDto) {
    return this.orderService.purchase(user, dto);
  }

  @Get('history')
  history(@GetUser() user: user) {
    return this.orderService.history(user);
  }

  @Get('detail/:id')
  detail(@GetUser() user: user, @Param('id') id: string) {
    return this.orderService.detail(user, id);
  }
}

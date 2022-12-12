import { Controller, Put, Param, Body, Get } from '@nestjs/common';
import { StaffOrderService } from './staff_order.service';
import { StaffOrderDto } from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { UseGuards } from '@nestjs/common/decorators';
import { identity } from 'rxjs';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Staff Order')
@Controller('staff-order')
export class StaffOrderController {
  constructor(private staffOrderService: StaffOrderService) {}

  @Put('updateOrderStatus/:id')
  updateOrderStatus(@GetUser() user: user, @Param('id') orderId: string) {
    return this.staffOrderService.updateOrderStatus(user, orderId);
  }
  @Put('cancelOrder/:id')
  cancelOrder(
    @GetUser() user: user,
    @Param('id') orderId: string,
    @Body() dto: StaffOrderDto,
  ) {
    return this.staffOrderService.cancelOrder(user, orderId, dto);
  }

  @Get('getAllOrder')
  getAllOrder(@GetUser() user: user) {
    return this.staffOrderService.getAllOrder(user);
  }

  @Get('getDetailOrder/:id')
  getDetailOrder(@GetUser() user: user, @Param('id') orderId: string) {
    return this.staffOrderService.getDetailOrder(user, orderId);
  }
  @Get('getPriceOrder/:id')
  getPriceOrder(@GetUser() user: user, @Param('id') orderId: string) {
    return this.staffOrderService.getPriceOrder(user, orderId);
  }
}

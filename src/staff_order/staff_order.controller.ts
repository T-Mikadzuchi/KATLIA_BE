import { Controller, Put, Param, Body } from '@nestjs/common';
import { StaffOrderService } from './staff_order.service';
import { StaffOrderDto } from './dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { UseGuards } from '@nestjs/common/decorators';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('staff-order')
export class StaffOrderController {
    constructor(private staffOrderService: StaffOrderService){}

    @Put('updateOrderStatus/:id')
    updateOrderStatus(@GetUser() user: user, @Param('id') orderId: string, ){
        return this.staffOrderService.updateOrderStatus(user,orderId);
      }
    @Put('cancelOrder/:id')
    cancelOrder(@GetUser() user: user, @Param ('id') orderId: string, @Body() dto: StaffOrderDto){
      return this.staffOrderService.cancelOrder(user,orderId,dto);
    }
}

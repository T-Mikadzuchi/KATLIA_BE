import { Module } from '@nestjs/common';
import { StaffOrderController } from './staff_order.controller';
import { StaffOrderService } from './staff_order.service';

@Module({
  controllers: [StaffOrderController],
  providers: [StaffOrderService]
})
export class StaffOrderModule {}

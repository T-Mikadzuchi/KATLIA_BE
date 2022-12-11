import {
  Controller,
  UseGuards,
  Get,
  Put,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { StaffDto } from './dto';
@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Admin Staff')
@Controller('staff')
export class StaffController {
  constructor(private staffSerVice: StaffService) {}

  @Get('getAllStaff')
  getAllStaff(@GetUser() user: user) {
    return this.staffSerVice.getAllStaff(user);
  }

  @Put('updateStaff/:id')
  updateAddress(
    @GetUser() user: user,
    @Param('id') userId: string,
    @Body() dto: StaffDto,
  ) {
    return this.staffSerVice.updateStaff(user, userId, dto);
  }

  @Post('addStaff')
  addAddress(@GetUser() user: user, @Body() dto: StaffDto) {
    return this.staffSerVice.addStaff(user, dto);
  }
}

import { Controller, Get, Param, Body } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { UseGuards } from '@nestjs/common/decorators';
import { use } from 'passport';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Statistic')
@Controller('statistics')
export class StatisticsController {
    constructor(private statisticsService: StatisticsService){}
    @Get('statisticsUser')
    async statisticsUser(@GetUser() user: user){
        return await this.statisticsService.statisticsUser(user);
    }
    @Get('newOrderOfMonth')
    async newOrderOfMonth(@GetUser() user: user){
        return await this.statisticsService.newOrderOfMonth(user);
    }
    @Get('orderPercentGrowth')
    async orderPercentGrowth(@GetUser() user:user){
        return await this.statisticsService.orderPercentGrowth(user);
    }
    @Get('revenueOfMonth')
    async revenueOfMonth(@GetUser() user: user){
        return await this.statisticsService.revenueOfMonth(user);
    }
    @Get('revenuePercentGrowth')
    async revenuePercentGrowth(@GetUser() user: user){
        return await this.statisticsService.revenuePercentGrowth(user);
    }
    @Get('orderPerMonth/:year')
    async orderPerMonth(@GetUser() user: user, @Param('year') year: number){
        return await this.statisticsService.orderPerMonth(user, year);
    }
    @Get('revenuePerMonth/:year')
    async revenuePerMonth(@GetUser() user: user, @Param('year') year: number){
        return await this.statisticsService.revenuePerMonth(user, year);
    }
    @Get('expenditureOfMonth')
    async expanditureOfMonth(@GetUser() user:user){
        return await this.statisticsService.importOfMonth();
    }
    
    
}

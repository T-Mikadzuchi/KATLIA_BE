import { Injectable, ForbiddenException } from '@nestjs/common';
import { user } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class StatisticsService {
    constructor(private prismaSerVice: PrismaService){}
    async isPermission( user: user){
        return (user.role=='ADMIN');
    }
    async statisticsUser(user: user){
        if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        const count_user = await this.prismaSerVice.user.count({
            where:{
                role:"CUSTOMER"
            }
        });
        return count_user;
    }

    async newOrderOfMonth(user: user){
        if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        let today = new Date();
        let firstDayMonth = new Date(today.setDate(1));
        firstDayMonth.setHours(0,0,0,0);
        let lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        lastDayMonth.setHours(0,0,0,0);
        const countOrder= await this.prismaSerVice.order_detail.count({
            where:{
                status: 4,        
                completedAt:{
                    lt: new Date(lastDayMonth),
                    gte: new Date(firstDayMonth),
                }      
            }
        });
               
        return countOrder;       
    }
    
    async orderPercentGrowth(user:user){
        if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        let today = new Date();
        let firstDayMonth = new Date(today.setDate(1));
        firstDayMonth.setHours(0,0,0,0);
        let lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        lastDayMonth.setHours(0,0,0,0);
        const monthOrder= await this.prismaSerVice.order_detail.count({
            where:{
                status: 4,        
                completedAt:{
                    lt: new Date(lastDayMonth),
                    gte: new Date(firstDayMonth),
                }      
            }
        });
        let d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - 1);
        let firstDayLastMonth = new Date(d);
        firstDayLastMonth.setHours(0,0,0,0);
        let lastDayLastMonth = new Date(today.setDate(1))
        lastDayLastMonth.setHours(0,0,0,0);
        const lastMonthOrder= await this.prismaSerVice.order_detail.count({
            where:{
                status: 4,        
                completedAt:{
                    lt: new Date(lastDayLastMonth),
                    gte: new Date(firstDayLastMonth),
                }      
            }
        });
        let percent= await ((monthOrder/lastMonthOrder)-1)*100;
        return percent;
    }
    async importOfMonth(){     
        let today = new Date();
        let firstDayMonth = new Date(today.setDate(1));
        firstDayMonth.setHours(0,0,0,0);
        let lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        lastDayMonth.setHours(0,0,0,0);
        const importList= await this.prismaSerVice.storage_import.findMany({
            where:{
                status: 2,        
                date:{
                    lt: new Date(lastDayMonth),
                    gte: new Date(firstDayMonth),
                }      
            }
        });
        let importOfMonth =0;
        for(const ip of importList){
            importOfMonth+= ip.total;
        }
               
        return importOfMonth;   
    }
    async incomeOfMonth(){
        let today = new Date();
        let firstDayMonth = new Date(today.setDate(1));
        firstDayMonth.setHours(0,0,0,0);
        let lastDayMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        lastDayMonth.setHours(0,0,0,0);
        const incomeList= await this.prismaSerVice.order_detail.findMany({
            where:{
                status: 4,        
                completedAt:{
                    lt: new Date(lastDayMonth),
                    gte: new Date(firstDayMonth),
                }      
            }
        });
        let incomeOfMonth =0;
        for(const ic of incomeList){
            incomeOfMonth+= ic.total;
            incomeOfMonth-=ic.shippingFee;
        }
               
        return incomeOfMonth;   
    }
    async revenueOfMonth(user: user){
        if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        const income= await this.incomeOfMonth();
        const ip= await this.importOfMonth();
        return (income-ip);
    }
    async importOfLastMonth(){
        let today=new Date();
        let d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - 1);
        let firstDayLastMonth = new Date(d);
        firstDayLastMonth.setHours(0,0,0,0);
        let lastDayLastMonth = new Date(today.setDate(1));
        lastDayLastMonth.setHours(0,0,0,0);
        const importList= await this.prismaSerVice.storage_import.findMany({
            where:{
                status: 2,        
                date:{
                    lt: new Date(lastDayLastMonth),
                    gte: new Date(firstDayLastMonth),
                }      
            }
        });
        let importOfLastMonth =0;
        for(const ip of importList){
            importOfLastMonth+= ip.total;
        }
        return importOfLastMonth;
    }
    async incomeOfLastMonth(){
        let today=new Date();
        let d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - 1);
        let firstDayLastMonth = new Date(d);
        firstDayLastMonth.setHours(0,0,0,0);
        let lastDayLastMonth = new Date(today.setDate(1));
        lastDayLastMonth.setHours(0,0,0,0);
        const incomeList= await this.prismaSerVice.order_detail.findMany({
            where:{
                status: 4,        
                completedAt:{
                    lt: new Date(lastDayLastMonth),
                    gte: new Date(firstDayLastMonth),
                }      
            }
        });
        let incomeOfLastMonth =0;
        for(const ic of incomeList){
            incomeOfLastMonth+= ic.total;
            incomeOfLastMonth-= ic.shippingFee;
        }
               
        return incomeOfLastMonth;  
    }
    async revenueOfLastMonth(user:user){
        if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        return (await this.incomeOfLastMonth()- await this.importOfLastMonth());
    }
    async revenuePercentGrowth(user:user){
        if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        const revenue= await this.revenueOfMonth(user);
        const last_revenue= await this.revenueOfLastMonth(user);
        return ((revenue/last_revenue)-1)*100;
    }
    async orderPerMonth(user: user, year: number){
        if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        let array =new Array (12);
        for(let i=0; i< 12; i++){
            let firstday= new Date(year, i, 1);                     
            let lastday= new Date(year, i+1, 1);
            array[i]= await this.prismaSerVice.order_detail.count({
                where:{
                    status: 4,
                    completedAt:{
                        lt: lastday,
                        gte: firstday,
                    }
                }
            });
        }
        return array;
    }
    
   async importPerMonth(user:user, year: number){
    if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        let array =new Array (12);
        for(let i=0; i< 12; i++){
            array[i]=0;
            let firstday= new Date(year, i, 1);                     
            let lastday= new Date(year, i+1, 1);
            const importList= await this.prismaSerVice.storage_import.findMany({
                where:{
                    status: 2,
                    date:{
                        lt: lastday,
                        gte: firstday,
                    }
                }
            });
            for(const ip of importList){
                array[i] += ip.total;
            }
                           
        }
        return array;
   }
   async incomePerMonth(user: user, year: number){
    if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        let array =new Array (12);
        for(let i=0; i< 12; i++){
            array[i]=0;
            let firstday= new Date(year, i, 1);                     
            let lastday= new Date(year, i+1, 1);
            const incomeList= await this.prismaSerVice.order_detail.findMany({
                where:{
                    status: 4,
                    completedAt:{
                        lt: lastday,
                        gte: firstday,
                    }
                }
            });
            for(const ic of incomeList){
                array[i] += ic.total;
                array[i] -= ic.shippingFee;
            }
                           
        }
        return array;
   }
   async revenuePerMonth(user: user, year:number){
    if (!(await this.isPermission(user)))
    throw new ForbiddenException('Permission denied');
    let array_import= await this.importPerMonth(user,year);
    let array_income= await this.incomePerMonth(user,year);
    let array = new Array(12);
    for(let i=0;i<12;i++)
    {
        array[i]=0;
        array[i]= array_income[i]-array_import[i];
    }
    return array;
   }
    
}

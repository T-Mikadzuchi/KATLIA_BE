import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { StaffOrderDto } from './dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { user } from '@prisma/client';

@Injectable()
export class StaffOrderService {
    constructor(private prismaService: PrismaService,
                private mailerService: MailerService,
                private config: ConfigService,){}
    
    async isSales(user: user) {
        return user.role == "SALES"
        }
    async updateQuatity( productId: number, colorId: number, size: string, quantity_order: number){
        const product=this.prismaService.product_detail.findFirst({
            where:{
                productId: productId,
                colorId: colorId,
                size: size,
            }
        });
        const quantity=(await product).quantity;
        const upadated= this.prismaService.product_detail.updateMany({
            where:{
                productId: productId,
                colorId: colorId,
                size: size 
            }, 
            data:{
                quantity: quantity-quantity_order,
            }
        });
        return upadated;
    }
    async updateOrderStatus(userr:user,orderId: string){
        if (!(await this.isSales(userr)))
            throw new ForbiddenException('Permission denied');
        const order= await this.prismaService.order_detail.findUnique({
            where:{
                id: orderId,
            },            
        });
        const sta= order.status +1;
        
        const updated= this.prismaService.order_detail.update({
            where:{
                id: orderId,
            },
            data:{
                status: sta, 
            }
        });
        

        if(sta==4)
        {
            const getItemOrder= await this.prismaService.order_item.findMany({
                where:{
                    orderId: orderId,
                }
            })
            for (const order_item of getItemOrder) {
                this.updateQuatity(order_item.productId,order_item.colorId, order_item.size, order_item.quantity)
                               
              }
        
        }

        const customerId= order.customerId;
        const customer= await this.prismaService.customer.findUnique({
            where:{
                id: customerId,
            }
        });
        const userId= customer.userId;
        const user= await this.prismaService.user.findUnique({
            where:{
                id:userId,
            }
        });
        var status_string;
        const email= user.email;
        switch(sta) {
            case 1:  
            status_string="PLACED";
            break;
            case 2:  
            status_string="PACKING";
            break;
            case 3:  
            status_string="SHIPPING";
            break;
            case 4:  
            status_string="COMPLETED";
            break;        
            
          }
          
            await this.mailerService.sendMail({
                to: email,
                from: this.config.get('MAIL_FROM'),
                subject: 'Your order be '+ status_string,
                text: 'Welcome honored guests,'+'\n\nKatliaFashion is pleased to announce that your order #'+
                orderId+' has been '+status_string,
    
                });
          
        
        return updated;
       
    }

    async cancelOrder(user: user,orderId: string, dto: StaffOrderDto){
        if (!(await this.isSales(user)))
            throw new ForbiddenException('Permission denied');
        const order= await this.prismaService.order_detail.findUnique({
            where:{
                id: orderId,
            }
        });
        const status= order.status ;
        if(status==1||status==2){
            const cancel= await this.prismaService.order_detail.update({
                where:{
                    id: orderId,
                },
                data:{
                    status: 5,
                    note: dto.cancelReason,
                }
            });
            const customerId= order.customerId;
            const customer= await this.prismaService.customer.findUnique({
                where:{
                    id: customerId,
                }
            });
            const userId= customer.userId;
            const user= await this.prismaService.user.findUnique({
                where:{
                    id:userId,
                }
            });
        
            const email= user.email;
            await this.mailerService.sendMail({
                to: email,
                from: this.config.get('MAIL_FROM'),
                subject: 'Your order be Cancel',
                text: 'Welcome honored guests,'+'\n\nKatliaFashion is sorry to announce that your order #'+
                orderId+' has been CANCEL'+'\n\nReason: '+dto.cancelReason,
    
                });

            return cancel;
        }
        else{
            console.log("Can't cancel the order!");
            return;
        }
        
    }
}

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { StaffOrderDto } from './dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { user } from '@prisma/client';
import { IsDate } from 'class-validator';
import { networkInterfaces } from 'os';

@Injectable()
export class StaffOrderService {
    constructor(private prismaService: PrismaService,
                private mailerService: MailerService,
                private config: ConfigService,){}
    
    async isPermission(user: user) {
        return (user.role == "SALES"||user.role=="ADMIN");
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
                quantity: quantity+quantity_order,
            }
        });
        return upadated;
    }
    async updateOrderStatus(userr:user,orderId: string){
        if (!(await this.isPermission(userr)))
            throw new ForbiddenException('Permission denied');
        const order= await this.prismaService.order_detail.findUnique({
            where:{
                id: orderId,
            },            
        });
        const sta= order.status +1;
        var completeDate= new Date();
        
        if(sta==4){
            const updated= await this.prismaService.order_detail.update({
                where:{
                    id: orderId,
                },
                data:{
                    status: sta, 
                    completedAt: completeDate,
                }
            });
            
        }
        else{
            const updated= await this.prismaService.order_detail.update({
                where:{
                    id: orderId,
                },
                data:{
                    status: sta, 
                }
            });
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
          
        
        
       
    }

    async cancelOrder(user: user,orderId: string, dto: StaffOrderDto){
        if (!(await this.isPermission(user)))
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
            const getItemOrder= await this.prismaService.order_item.findMany({
                where:{
                    orderId: orderId,
                }
            })
            for (const order_item of getItemOrder) {
                this.updateQuatity(order_item.productId,order_item.colorId, order_item.size, order_item.quantity)
                               
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

    async getAllOrder(user: user){
        if (!(await this.isPermission(user)))
            throw new ForbiddenException('Permission denied');
        const getAllOrder= await this.prismaService.order_detail.findMany({
            where:{
                OR: [
                    {
                      status: 1,
                    },
                    {
                        status: 2,
                    },
                    {
                        status: 3,
                    },
                    {
                        status: 4,
                    },
                    {
                        status: 5,
                    }
                ]
            },
            orderBy:{
                createdAt:"desc",
            }
        });
        const orderList: any[]=[];
        for(const order of getAllOrder){
            
            orderList.push({
                orderId: order.id,
                customerName: order.fullName,
                address: order.address,
                createDate: order.createdAt,
                total: order.total,
                status: order.status,
            });
        }
        return orderList;
    }
   async getDetailOrder(user: user, orderId: string){
        if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
        
        const getAllItemOrder= await this.prismaService.order_item.findMany({
            where:{
                orderId: orderId,
            }, select:{
                id: true,
                orderId: true,
                currentPrice: true,
                productId: true,
                size: true,
                colorId: true,
                quantity: true,
                currentSalesPrice: true,
            }
        });
       
       return getAllItemOrder;
   }
   async getPriceOrder( user: user, orderId: string){
    if (!(await this.isPermission(user)))
        throw new ForbiddenException('Permission denied');
    const getAllItem= await this.prismaService.order_item.findMany({
        where:{
            orderId: orderId,
        }
    });
    let total = 0;
    let discount=0;
    
    for(const item of getAllItem)
    {
        total += item.currentPrice*item.quantity;
        discount+= (item.currentSalesPrice*item.quantity);
    }
    const order= await this.prismaService.order_detail.findUnique({
        where:{
            id: orderId,
        }
    });
    let shippingFee= order.shippingFee;
    const getprice ={"total": total, "shippingFee": shippingFee,"discount":discount, "subtotal": total+shippingFee-discount};
    
    return getprice;    
   }
    
   
}

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { user } from '@prisma/client';
import { StaffDto } from './dto';
import { AdminService } from '../admin.service';

@Injectable()
export class StaffService {
    constructor(private prismaService: PrismaService,
                private adminService: AdminService,
                ){}
    
    async getuser(){
        const getUser = await this.prismaService.user.findMany();
        const userList: any[]=[];
        
        for(const user of getUser){
            userList.push({
                id: user.id,
                fullname: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
            })
        };
        return userList;
    }
    async getStaff (){
        const staffList: any[] = [];
        const getStaff= await this.prismaService.staff.findMany();
        for(const staff of getStaff){
            staffList.push({
                id: staff.id,
                userId: staff.userId,
                status: staff.status,
                startAt: staff.startAt,
            })
        }
        return staffList;
    }

    async getAllStaff(user: user){
        if (!(await this.adminService.isAdmin(user)))
        throw new ForbiddenException('Permission denied');
        const userList = await this.getuser();
        const staffList= await this.getStaff()
        
        const List: any[]=[];
        for (const staff of staffList) {
            for(const user of userList)
            {
                if(user.id==staff.userId)
                {
                    List.push({
                        email: user.email,
                        fullname: user.fullName,
                        phoneNumber: user.phoneNumber,
                        role: user.role,
                        staffId: staff.id,
                        startAt: staff.startAt,
                        status: staff.status,
                    });
                }
            }
        }
        return List;
        
    }


    async updateStaff(user: user, userId:string, dto: StaffDto){
        if (!(await this.adminService.isAdmin(user)))
        throw new ForbiddenException('Permission denied');
        const updateUser= await this.prismaService.user.update({
            where:{
                id: userId,
            }, data:{
                
                role: dto.role,
            }
        });
        const upadteStaff = await this.prismaService.staff.update({
            where:{
                userId: userId,
            }, data:{
                startAt: dto.startAt,
                status: dto.status,
            }
        });
    }
    async addStaff(user: user, dto: StaffDto){
        if (!(await this.adminService.isAdmin(user)))
        throw new ForbiddenException('Permission denied');
        const userr = await this.prismaService.user.findUnique({
            where: {
              email: dto.email,
            },
          });
          if (userr) {
            return new ForbiddenException('Credential taken');
          }
        const addStaffUser= await this.prismaService.user.create({
            data:{
                email: dto.email,
                password: '1234',
                role: dto.role,
                            
            }
        });
        const addStaff= await this.prismaService.staff.create({
            data:{
                userId: addStaffUser.id,
                startAt: dto.startAt,
                status: dto.status,
            }
        });
        return addStaff;

    }

}

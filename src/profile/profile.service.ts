import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { user } from '@prisma/client';
import { ProfileDto } from './dto';
@Injectable()
export class ProfileService {
    constructor(private prismaService: PrismaService){}

    async updateProfile(user: user, dto: ProfileDto){
        
    }
}

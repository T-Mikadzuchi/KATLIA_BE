import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class ProfileDto{

    @ApiProperty()
    gender: Gender

    @ApiProperty()
    fullName: string

    @ApiProperty()
    phoneNumber: string
    
    @ApiProperty()
    birthday: Date   
    
    @ApiProperty()
    imageUrl: string
    
    @ApiProperty()
    address: string
    
    @ApiProperty()
    province: string
    
    @ApiProperty()
    district: string
   
    @ApiProperty()
    ward: string
    
    @ApiProperty()
    note: string
}
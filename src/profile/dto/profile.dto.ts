import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class ProfileDto{

    @ApiProperty()
    @IsNotEmpty()
    gender: Gender

    @ApiProperty()
    @IsNotEmpty()
    fullName: string

    @ApiProperty()
    @IsNotEmpty()
    phoneNumber: string
    
    @ApiProperty()
    @IsNotEmpty()
    birthday: Date   
    
    @ApiProperty()
    @IsNotEmpty()
    imageUrl: string
    
    @ApiProperty()
    @IsNotEmpty()
    address: string
    
    @ApiProperty()
    @IsNotEmpty()
    province: string
    
    @ApiProperty()
    @IsNotEmpty()
    district: string
   
    @ApiProperty()
    @IsNotEmpty()
    ward: string
    
    @ApiProperty()
    @IsNotEmpty()
    note: string
}
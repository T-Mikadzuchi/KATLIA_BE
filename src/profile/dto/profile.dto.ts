import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class ProfileDto{

    @ApiProperty()
    @IsNotEmpty()
    gender: string

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
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddressDto {
    
    @ApiProperty()
    @IsNotEmpty()
    fullname: string

    @ApiProperty()
    @IsNotEmpty()
    phonenumber: string

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
    note: string

    @ApiProperty()
    @IsNotEmpty()
    setAsDefault: boolean
  
}

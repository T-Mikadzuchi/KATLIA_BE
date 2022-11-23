import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsNumberString } from 'class-validator';

export class OrderDto {
  @ApiProperty()
  @IsNotEmpty()
  receiverName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  receiverPhone: string;

  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  payment: number;

  @ApiProperty()
  note: string;

  @ApiProperty()
  voucherId: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class StaffDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: ['ADMIN', 'SALES', 'STORAGE']})
  @IsNotEmpty()
  role: Role;

  @ApiProperty()
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  birthday: Date;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  province: string;

  @ApiProperty()
  @IsNotEmpty()
  district: string;

  @ApiProperty()
  @IsNotEmpty()
  ward: string;

  @ApiProperty()
  note: string;

  @ApiProperty()
  @IsNotEmpty()
  startAt: Date;

  @ApiProperty()
  @IsNotEmpty()
  status: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class ProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsNumberString()
  phoneNumber: string;

  @ApiProperty()
  birthday: Date;

  @ApiProperty()
  address: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  ward: string;

  @ApiProperty()
  note: string;
}

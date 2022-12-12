import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class ProfileDto {
  @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: Gender;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
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


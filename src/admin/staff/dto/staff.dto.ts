import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class StaffDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;

    @ApiProperty()
    @IsNotEmpty()
    role:Role
    
    @ApiProperty()
    @IsNotEmpty()
    startAt: Date

  @ApiProperty()
  @IsNotEmpty()
  status: number;
}

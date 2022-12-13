import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
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
  startAt: Date;
   
  @ApiProperty()
  status: number;
}

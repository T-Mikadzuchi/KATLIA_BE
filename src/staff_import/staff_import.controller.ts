import { StaffImportService } from './staff_import.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Patch, UseGuards, Param } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { ImportDto } from './dto';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Staff Import')
@Controller('staff-import')
export class StaffImportController {
  constructor(private staffImportService: StaffImportService) {}

  @Patch('import')
  import(@GetUser() user: user, @Body() dto: ImportDto) {
    return this.staffImportService.import(user, dto);
  }

  @Get('history')
  history(@GetUser() user: user) {
    return this.staffImportService.history(user);
  }

  @Get('importInfo/:id')
  info(@GetUser() user: user, @Param('id') id: string) {
    return this.staffImportService.info(user, id);
  }

  @Get('detail/:id')
  detail(@GetUser() user: user, @Param('id') id: string) {
    return this.staffImportService.detail(user, id);
  }
}

import {
  Controller,
  UseGuards,
  Put,
  Param,
} from '@nestjs/common';
import { ImportService } from './import.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Admin Import')
@Controller('import')
export class ImportController {
  constructor(private importService: ImportService) {}
  @Put('confirmImport/:id')
  async confirmImport(@GetUser() user: user, @Param('id') importId: string) {
    return await this.importService.confirmImport(user, importId);
  }
  @Put('cancelImport/:id')
  async cancelImport(@GetUser() user: user, @Param('id') importId: string) {
    return await this.importService.cancelImport(user, importId);
  }
}

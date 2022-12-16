import { Controller, UseGuards, Get, Put, Post,Param,Body } from '@nestjs/common';
import { ImportService } from './import.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Admin Staff')
@Controller('import')
export class ImportController {
    constructor( private importService: ImportService){    
    }
    @Put('confirmImport/:id')
    confirmImport(@GetUser() user:user, @Param('id')  importId:string){
        return this.importService.confirmImport(user,importId);
    }
    @Put('cancelImport:/id')
    cancelImport(@GetUser() user: user,@Param('id') importId: string){
        return this.importService.cancelImport(user,importId);
    }
}

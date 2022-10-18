import { MailDto } from './dto/mail.dto';
import { MailService } from './mail.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('sendEmailVerification')
  // @ApiBody({
  //   schema: {
  //     properties: {
  //       'email': { type: 'string' }
  //     }
  //   }
  // })
  verifyEmail(@Body() dto: MailDto) {
    return this.mailService.verifyEmail(dto);
  }
}

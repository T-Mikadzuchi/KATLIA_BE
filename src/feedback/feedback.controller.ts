import { FeedbackService } from './feedback.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { user } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { FeedbackDto } from './dto';
import {
  AzureStorageFileInterceptor,
  UploadedFileMetadata,
} from '@nestjs/azure-storage';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Get('getProductsForFeedback/:orderId')
  getProductsForFeedback(@GetUser() user: user, @Param('orderId') id: string) {
    return this.feedbackService.getProductsForFeedback(user, id);
  }

  @ApiBody({
    schema: {
      type: 'array',
      items: {
        properties: {
          productId: {
            type: 'number',
          },
          hideUsername: {
            type: 'boolean',
          },
          comment: {
            type: 'string',
          },
          rate: {
            type: 'number',
          },
        },
      },
    },
  })
  @Post('writeFeedback/:orderId')
  async writeFeedback(
    @GetUser() user: user,
    @Param('orderId') id: string,
    @Body() array: FeedbackDto[],
  ) {
    return await this.feedbackService.writeFeedback(user, id, array);
  }

  @Patch('upImageForFeedback')
  @UseInterceptors(
    AzureStorageFileInterceptor('file', null, {
      containerName: 'img',
    }),
  )
  async upImageForFeedback(
    @GetUser() user: user,
    @Query('orderId') orderId: string,
    @Query('productId') id: string,
    @UploadedFile() file: UploadedFileMetadata,
  ) {
    const productId = parseInt(id)
    return await this.feedbackService.upImageForFeedback(user, orderId, productId, file.storageUrl);
  }
}

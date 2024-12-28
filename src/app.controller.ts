import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Logger } from 'winston';
import { HookMessageDataType, SentryRequestType } from './app';
import { AppInterceptor } from './app.interceptor';
import { AppService } from './app.service';
import { AppHelper } from './app.helper';

@Controller()
@UseInterceptors(AppInterceptor)
export class AppController {
  constructor(
    @Inject('winston')
    private readonly logger: Logger,
    private readonly appService: AppService,
    private readonly appHelper: AppHelper,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Post('/sentry/webhooks')
  @HttpCode(HttpStatus.OK)
  webhooks(@Body() reqBody: SentryRequestType) {
    const running = async () => {
      try {
        this.logger.info('hit webhook endpoint');
        const { error } = reqBody.data;
        // this.logger.info('issue', reqBody.data);
        // const hookMessageData: HookMessageDataType = {
        //   issueAction: reqBody.action,
        //   appName: error.project.name,
        //   title: error.title,
        //   errorPosition: error.culprit,
        //   detailLink: error.url,
        //   ...issueDetails,
        // };
        this.appService.sentTelegramMessage({
          title: error.title,
          detailLink: error.web_url,
          appName: error.transaction,
        });
      } catch (ex) {
        this.logger.error('Error in webhook endpoint', ex);
      }
    };
    running();
    return reqBody.installation || { message: 'success' };
  }
}

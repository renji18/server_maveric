import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { TestService } from './test.service';
import { EntryTestDto } from 'src/dtos/test_dto/entry.test.dto';
import { Request as ExpressRequest, Response } from 'express';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @HttpCode(HttpStatus.OK)
  @Post('entry/create')
  createEntryTest(
    @Body() testData: { data: EntryTestDto[] },
    @Res() response: Response,
  ) {
    return this.testService.createEntryTest(testData?.data, response);
  }

  @HttpCode(HttpStatus.OK)
  @Get('entry/get')
  getEntryTest(@Res() response: Response) {
    return this.testService.getEntryTest(response);
  }

  @HttpCode(HttpStatus.OK)
  @Post('entry/take')
  takeEntryTest(
    @Request() req: ExpressRequest,
    @Body() testData: { data: EntryTestDto[] },
    @Res() response: Response,
  ) {
    return this.testService.takeEntryTest(
      req['user']['email'],
      testData?.data,
      response,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('private/create')
  createPrivateTest(
    @Request() req: ExpressRequest,
    @Body() testData: { data: EntryTestDto[] },
    @Res() response: Response,
  ) {
    return this.testService.createPrivateTest(
      req['user']['email'],
      testData?.data,
      response,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('private/get/:testId')
  getPrivateTest(@Param('testId') testId: string, @Res() response: Response) {
    return this.testService.getPrivateTest(testId, response);
  }

  @HttpCode(HttpStatus.OK)
  @Post('private/take/:testId')
  takePrivateTest(
    @Param('testId') testId: string,
    @Request() req: ExpressRequest,
    @Body() testData: { data: EntryTestDto[] },
    @Res() response: Response,
  ) {
    return this.testService.takePrivateTest(
      testId,
      req['user']['email'],
      testData?.data,
      response,
    );
  }
}

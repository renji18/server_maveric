import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SkipAuth } from './skip.auth';
import { Request as ExpressRequest, Response } from 'express';
import { LoginUserDto } from 'src/dtos/auth_dto/login.user.dto';
import { RegisterUserDto } from 'src/dtos/auth_dto/register.user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: LoginUserDto, @Res() response: Response) {
    return this.authService.signIn(loginDto, response);
  }

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerDto: RegisterUserDto, @Res() response: Response) {
    return this.authService.register(registerDto, response);
  }

  @HttpCode(HttpStatus.OK)
  @Get('signout')
  signOut(@Request() req: ExpressRequest, @Res() response: Response) {
    return this.authService.signOut(req['user']['email'], response);
  }
}

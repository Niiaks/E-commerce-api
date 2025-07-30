import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';

import { AuthGuard } from './guard/HybridGuard';
import { RolesGuard } from './guard/roleGuard';
import { Role } from 'src/users/entities/user.entity';

const { ADMIN } = Role;

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() registerDto: RegisterDto,
    @Headers('x-idem-key') idempotencyKey: string,
  ) {
    const user = await this.authService.signup(registerDto);
    return {
      message: user.message,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  @Post('signin')
  async signin(@Body() loginDto: LoginDto, @Req() request: Request) {
    return await this.authService.signin(loginDto);
  }
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const tokens = await this.authService.refreshAccessToken(refreshToken);
    return {
      message: 'Token refreshed successfully',
      tokens: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      },
    };
  }

  @Post('logout')
  async logout(@Req() @Body('token') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return {
      message: 'logout successful',
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() request: Request) {
    const user = await this.authService.findOne(request.user?.userId as string);
    return user;
  }

  @Get('admin')
  @UseGuards(AuthGuard, new RolesGuard(ADMIN))
  async getAdminData() {
    return { message: 'This is admin-only data' };
  }
}

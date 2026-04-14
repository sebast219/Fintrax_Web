import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { RateLimitAuth, RateLimitNormal } from '../../common/decorators/rate-limit.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UseGuards(RateLimitGuard)
  @RateLimitAuth()
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  @UseGuards(RateLimitGuard)
  @RateLimitAuth()
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimitNormal()
  @ApiBearerAuth()
  refresh(@CurrentUser('sub') userId: string) {
    return this.authService.refreshToken(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimitNormal()
  @ApiBearerAuth()
  getMe(@CurrentUser() user: any) {
    return user;
  }
}

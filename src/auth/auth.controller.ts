import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { User } from '../common/entity/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { randomBytes } from 'crypto';
import { ExistUserIdPipe } from './pipe/exist-user-id.pipe';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import userVerifyCode from '../common/class/user-verify-code';
import { VerifyEmailCodeGuard } from './guard/verify-email-code.guard';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { UserRequest } from '../common/@types/user-request';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return await this.authService.login(req.user);
  }

  @UseGuards(VerifyEmailCodeGuard)
  @Post('register')
  async register(@Body(ExistUserIdPipe) registerDto: RegisterDto) {
    let salt: string;
    const user = new User(
      registerDto.email,
      await this.authService.saltHash(
        registerDto.password,
        (salt = randomBytes(64).toString('base64')),
      ),
    );
    user.pwSalt = salt;
    return await this.authService.login(user);
  }

  @HttpCode(204)
  @Post('verify_email')
  async sendVerifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    await this.authService.sendVerifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.method,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reset_password')
  async retsetPassword(
    @Request() req: UserRequest,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    let res: boolean = await this.authService.resetUserPassword(
      req.user,
      resetPasswordDto.beforePassword,
      resetPasswordDto.afterPassword,
    );

    if (res) {
      return { message: 'success' };
    } else {
      throw new BadRequestException();
    }
  }
}

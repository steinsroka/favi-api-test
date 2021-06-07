import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { User } from '../common/entity/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { randomBytes } from 'crypto';
import { ExistUserIdPipe } from './pipe/exist-user-id.pipe';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

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
    return await this.userService.saveUser(user);
  }
}

import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { randomBytes } from 'crypto';
import { ExistUserIdPipe } from './pipe/exist-user-id.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body(ExistUserIdPipe) registerDto: RegisterDto) {
    let salt: string;
    const user = new User(registerDto.email, await this.authService.saltHash(registerDto.password, salt = randomBytes(64).toString('base64')));
    user.pw_salt = salt;
    return this.userService.saveUser(user);
  }
}

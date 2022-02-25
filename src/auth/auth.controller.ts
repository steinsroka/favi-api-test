import {
  BadRequestException,
  Body,
  Controller,
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
import { VerifyEmailCodeGuard } from './guard/verify-email-code.guard';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { UserRequest } from '../common/@types/user-request';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('Auth(인증) 관련 API')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 201,
    description: '토큰 발급 성공 (로그인 성공)',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'id나 pw가 일치하지 않음',
  })
  @ApiResponse({
    status: 401,
    description: 'Field중 일부가 누락됨 (id나 pw 필드 자체가 없음)',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    @Body() loginDto: LoginDto,
  ): Promise<TokenResponseDto> {
    return await this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @ApiHeader({
    name: 'authorization',
    description:
      '앞의 이메일 인증에서 사용자가 메일로 받은 인증코드 (예시: 883675)',
  })
  @ApiBody({ type: RegisterDto })
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원 가입 성공',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Header에 Email 정보가 틀리거나, 헤더 Field가 없음',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 유저 (중복 회원가입) ',
  })
  @UseGuards(VerifyEmailCodeGuard)
  @Post('register')
  async register(@Body(ExistUserIdPipe) registerDto: RegisterDto) {
    let salt: string;
    const user = new User(
      registerDto.email,
      // unique한 salt값과 password를 암호화하는 saltHash에 보냄
      await this.authService.saltHash(
        registerDto.password,
        (salt = randomBytes(64).toString('base64')),
      ),
    );
    user.pwSalt = salt; // salt하는데 사용된 값을 같이 저장함
    const newUser = await this.userService.saveUser(user);
    return await this.authService.login(newUser);
  }

  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 201,
    description: '이메일 발송됨',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 유저 (중복 회원가입) ',
  })
  @ApiOperation({ summary: '이메일 인증' })
  @Post('verify_email')
  async sendVerifyEmail(@Body(ExistUserIdPipe) verifyEmailDto: VerifyEmailDto) {
    await this.authService.sendVerifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.method,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '변경 성공',
  })
  @ApiResponse({
    status: 400,
    description: '현재 비밀번호와 beforePassword 필드가 일치하지 않음',
  })
  @ApiResponse({
    status: 401,
    description: '로그인하지 않았거나, 유효하지 않은 JWT 토큰 (토큰 만료 등)',
  })
  @ApiOperation({ summary: '비밀번호 변경' })
  @UseGuards(JwtAuthGuard)
  @Patch('reset_password')
  async retsetPassword(
    @Request() req: UserRequest,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const res: boolean = await this.authService.resetUserPassword(
      req.user,
      resetPasswordDto.beforePassword,
      resetPasswordDto.afterPassword,
    );

    if (res) {
      return { message: 'success' };
    } else {
      throw new BadRequestException(
        'password is not match on current passowrd',
      );
    }
  }
}

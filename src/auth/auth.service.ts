import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { AuthConfig } from '../config/configInterface';
import { User } from '../common/entity/user.entity';
import { UserService } from '../user/user.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import userVerifyCode from '../common/class/user-verify-code';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.hashIter = configService.get<AuthConfig>('auth').hashIter;
  }

  private readonly hashIter: number;

  async saltHash(password: string, salt: string): Promise<string> {
    let key = salt + password;
    for (let i = 0; i < this.hashIter; ++i) {
      key = createHash('sha512').update(key).digest('base64');
    }
    return key;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.getUserAuthInfo({ email: email });
    if (
      user === undefined ||
      (await this.saltHash(password, user.pwSalt)) !== user.password
    ) {
      return null;
    }
    return user;
  }

  async login(user: User) {
    const payload: JwtPayloadDto = { userId: user.id };
    return {
      message: 'success',
      token: this.jwtService.sign(payload),
    };
  }

  async sendVerifyEmail(email: string, method: string) {
    const verifyInfo = await userVerifyCode.setCode(email, method);
    const transporter = createTransport(
      this.configService.get<SMTPTransport.Options>('mail'),
    );
    await transporter.sendMail({
      from: `arcane`,
      to: email,
      subject: 'arcane auth number',
      text: `your auth code is ${verifyInfo.code}`,
    });
  }

  async resetUserPassword(
    user: User,
    beforePassword: string,
    afterPassword: string,
  ) {
    const cipherBefore = await this.saltHash(beforePassword, user.pwSalt);
    if (cipherBefore === user.password) {
      //TODO:Check AfterPassword is satisfied our condition
      let salt: string;
      const cipherAfter = await this.saltHash(
        afterPassword,
        (salt = randomBytes(64).toString('base64')),
      );
      user.pwSalt = salt;
      user.password = cipherAfter;
      this.userService.saveUser(user);
      return true;
    } else {
      return false;
    }
  }
}

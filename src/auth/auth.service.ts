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

  /**
   * 유저가 로그인 할때 토큰 생성
   * 유저가 요청을 보낼 때 그 요청 안에 있는 Header에 토큰을 넣어서 요청을 보내고, 요청안에 payload가 있음
   * payload안에 유저 이름을 넣어주고 토큰이 유효한지 서버에서 secret text를 이용해서 알아냄
   * payload안에 유저 이름을 이용해서 DB의 유저이름에 해당하는 정보를 가져올 수 있었음
   *
   * 1. user name, secret text 전송(request)
   * 2. server에서 user information을 포함한 token을 생성
   * 3. token을 클라이언트로 돌려줌(response의 header안에 넣어줌)
   * 4. 클라이언트는 토큰을 쿠키에 저장함 (로그인 끝)
   * 5. 토큰과 함께 서버에 새로운 request (유저로서 보내는 request)
   * 6. 서버는 토큰을 decode하여 유저 정보를 알 수 있도록 함.
   *
   * Passport 모듈로 5,6번 과정을 쉽게 처리
   */
  async login(user: User) {
    const payload: JwtPayloadDto = { userId: user.id }; // 유저토큰 생성(secret + payload)

    return {
      message: 'success',
      token: this.jwtService.sign(payload), // accessToken 생성
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
      subject: 'FAVI 이메일 인증 입니다.',
      // text: `your auth code is ${verifyInfo.code}`,
      html: `<div style="color: rgb(17, 17, 17); font-family: &quot;Apple SD Gothic Neo&quot;, &quot;Malgun Gothic&quot;, &quot;맑은 고딕&quot;, sans-serif; line-height: 1.5;"><div style="color: rgb(17, 17, 17); font-family: &quot;Apple SD Gothic Neo&quot;, &quot;Malgun Gothic&quot;, &quot;맑은 고딕&quot;, sans-serif; line-height: 1.5;"><div style="color: rgb(17, 17, 17); font-family: &quot;Apple SD Gothic Neo&quot;, &quot;Malgun Gothic&quot;, &quot;맑은 고딕&quot;, sans-serif; line-height: 1.5;"><div style="color: rgb(17, 17, 17); font-family: &quot;Apple SD Gothic Neo&quot;, &quot;Malgun Gothic&quot;, &quot;맑은 고딕&quot;, sans-serif; line-height: 1.5;"><div style="color: rgb(17, 17, 17); font-family: &quot;Apple SD Gothic Neo&quot;, &quot;Malgun Gothic&quot;, &quot;맑은 고딕&quot;, sans-serif; line-height: 1.5; background-color: rgb(255, 255, 255);"><div style="padding:15px;"><div style="color:#9058fa;font-weight:bold;font-size:39px;height:60px;font-family: Arial;"><span style="font-family: tahoma, sans-serif;"><span style="color: rgb(0, 0, 0);">LET'S</span></span></div><div style="color: rgb(144, 88, 250); font-size: 39px;font-family: Arial;"><span style="font-family: tahoma, sans-serif;"><span style="color: rgb(0, 0, 0);"><b>FALL IN VIBE , <span style="color: rgb(144, 88, 250);">FAVI</span></b></span></span></div><div style="padding-top:30px;font-size: 12px;">파비 서비스 본인 인증을 진행하기&nbsp;위해 아래 코드를 입력해 주세요.</div><div style="padding-top:10px;font-size: 12px;">오직 사용자 인증을 위해서만 사용되므로&nbsp;안심하고 이용해주세요.</div><div style="padding-top:10px;font-size: 12px;"><br></div><div style="padding-top:10px;font-size: 12px;"><b>이메일 인증 코드 (5분이내 응답)</b><br></div><div style="padding-top:20px;padding-bottom: 30px;"><a style="display:inline-block;color:#fff;background-color:#9058fa;padding:15px;font-weight:bold;text-decoration:none;font-family: Arial;border-radius:0px;" rel="noopener noreferrer" target="_blank"><span style="font-size: 14pt;">${verifyInfo.code}</span></a></div><div style="padding-top:10px;padding-bottom: 10px;"><br></div><div style="border:1px solid #dbdce0; background-color: #f0f0f4;padding:24px;margin-bottom:22px;"><div style="font-size:14px;font-weight:bold;margin-bottom:10px;">&lt; HELP &amp; INFORMATION<span style="color:#d40100;">&nbsp;</span><span style="color:#000000;">&gt;</span></div><div style="color:#5f5f5f;font-size:12px;line-height:25px;">대표전화 : 010-3504-5010</div><div style="color:#5f5f5f;font-size:12px;line-height:25px;">사업자 등록 번호 :&nbsp;<span style="color:rgb(95,95,95);font-family:&quot;font-size:12px;font-style:normal;font-variant-ligatures:normal;font-variant-caps:normal;font-weight:400;letter-spacing:normal;orphans:2;text-align:start;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;-webkit-text-stroke-width:0px;background-color:rgb(240, 240, 244);text-decoration-thickness:initial;text-decoration-style:initial;text-decoration-color:initial;display:inline !important;float:none;">171-</span><span style="color:rgb(95,95,95);font-family:&quot;font-size:12px;font-style:normal;font-variant-ligatures:normal;font-variant-caps:normal;font-weight:400;letter-spacing:normal;orphans:2;text-align:start;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;-webkit-text-stroke-width:0px;background-color:rgb(240, 240, 244);text-decoration-thickness:initial;text-decoration-style:initial;text-decoration-color:initial;display:inline !important;float:none;">86-02100</span>&nbsp;<br>대구광역시 중구 태평로 160, 11층 1105호 (북성로1가, 대구스테이션센터)</div><div style="color:#5f5f5f;font-size:12px;line-height:25px;"><br></div><a href="https://arcane-official.com" target="_blank" style="color:#5f5f5f;font-size:12px;line-height:25px;" rel="noopener noreferrer"><img src="https://s3.ap-northeast-2.amazonaws.com/acanegallery.com/ARCANE_WEB/v3/logo.png" style="width: auto; height: 1.5em;"></a></div><div style="text-align:right;font-weight:bold;font-family:Arial;"><a href="https://favi.kr/About" rel="noopener noreferrer" target="_blank"><span style="font-weight:bold;font-size:12px;color:#5f5f5f;text-decoration:underline;">FAVI는 어떤&nbsp;서비스 인가요?<br></span></a></div></div></div></div></div><p><br></p></div><p><br></p></div><p><br></p>`,
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

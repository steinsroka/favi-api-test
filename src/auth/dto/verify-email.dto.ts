import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyEmailDto {

  @ApiProperty({
    example: "wahowed331@zoeyy.com",
    description: "이메일 인증을 할 이메일 주소"
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "register",
    description: "이메일 인증을 통해 사용할 api 끝단, 현재는 register에서 사용"
  })
  @IsString()
  method: string;
}

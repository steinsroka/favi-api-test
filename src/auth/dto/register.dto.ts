import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'wahowed331@zoeyy.com',
    description: '회원 가입 할 email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '1q2w3e4r5t',
    description: '회원가입 할 패스워드, 영문 + 숫자로 8글자 이상',
  })
  @IsString()
  @Length(8)
  password: string;
}

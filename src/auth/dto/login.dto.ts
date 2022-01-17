import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'wahowed331@zoeyy.com',
    description: '로그인할 사용자의 email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '1q2w3e4r',
    description: '로그인할 사용자의 패스워드',
  })
  @IsString()
  password: string;
}

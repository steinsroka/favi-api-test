import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterDto {
  
  @ApiProperty({
    example: "example@gmail.com",
    description: "로그인할 사용자의 email"
  })
  @IsEmail()
  email: string;

  @IsString()
  @Length(8)
  password: string;
}

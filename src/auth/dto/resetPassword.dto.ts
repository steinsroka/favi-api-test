import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: '1q2w3e4r',
    description: '기존 비밀번호',
  })
  @IsString()
  beforePassword: string;

  @ApiProperty({
    example: 'abcd1234',
    description: '변경할 비밀번호',
  })
  @IsString()
  afterPassword: string;
}

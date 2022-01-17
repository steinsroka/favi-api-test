import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  constructor(_token: string) {
    token: _token;
  }

  @ApiProperty({
    example: 'success',
    description: '성공시 반환',
  })
  message: string;
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQzMiwiaWF0IjoxNjQwNzU1NTczLCJleHAiOjE2NDMzNDc1NzN9.dkf4uKADMEFOvRSY2bjqpe0C40t-MJglpyZNc1XJyn8',
    description: 'JWT token',
  })
  token: string;
}

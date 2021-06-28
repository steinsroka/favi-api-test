import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  beforePassword: string;

  @IsString()
  afterPassword: string;
}

import { ConflictException } from '@nestjs/common';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class ExistUserIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: RegisterDto, metadata: ArgumentMetadata) {
    if (metadata.type === 'body') {
      if (await this.userService.isExistUser({ email: value.email })) {
        throw new ConflictException(
          `user email ${value.email} is already exist.`,
        );
      }
    }
    return value;
  }
}

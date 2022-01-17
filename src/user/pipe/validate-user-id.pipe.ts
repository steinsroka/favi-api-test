import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
} from '@nestjs/common';
import { isDefined } from 'class-validator';
import { UserService } from '../../user/user.service';

@Injectable()
export class ValidateUserIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (
      (metadata.type === 'param' && metadata.data === 'user_id') ||
      (metadata.type === 'query' && metadata.data === 'user_id')
    ) {
      if (!isDefined(value) || isNaN(value)) return undefined;
      if (!(await this.userService.isExistUser({ id: value }))) {
        throw new NotFoundException(`user id ${value} is not exist.`);
      }
    }
    return value;
  }
}

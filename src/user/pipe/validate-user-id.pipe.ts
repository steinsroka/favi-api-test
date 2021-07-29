import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { isDefined } from 'class-validator';
import { ErrorString } from '../../common/const/error-string';
import { ErrorMessage } from '../../common/class/error-message';
import { UserService } from '../../user/user.service';

@Injectable()
export class ValidateUserIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if ((metadata.type === 'param' && metadata.data === 'id') || (metadata.type === 'query' && metadata.data === 'user_id')) {
      if(!isDefined(value))
        return value;
      if (!(await this.userService.isExistUser({ id: value }))) {
        throw new NotFoundException(
          new ErrorMessage(
            `user id ${value} is not exist.`,
            ErrorString.FAIL_EXIST,
          ),
        );
      }
    }
    return value;
  }
}

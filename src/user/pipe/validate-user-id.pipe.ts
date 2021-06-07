import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorString } from 'src/common/const/error-string';
import { ErrorMessage } from '../../common/class/error-message';
import { UserService } from '../../user/user.service';

@Injectable()
export class ValidateUserIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param' && metadata.data === 'id') {
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

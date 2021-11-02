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
export class ValidateAlbumIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param' && metadata.data === 'album_id') {
      if (!(await this.userService.isExistAlbum({ id: value }))) {
        throw new NotFoundException(
          new ErrorMessage(
            `album id ${value} is not exist.`,
            ErrorString.FAIL_EXIST,
          ),
        );
      }
    }


    return value;
  }
}

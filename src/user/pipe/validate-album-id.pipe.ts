import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';

@Injectable()
export class ValidateAlbumIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param' && metadata.data === 'album_id') {
      if (!(await this.userService.isExistAlbum({ id: value }))) {
        throw new NotFoundException(`album id ${value} is not exist.`);
      }
    }

    return value;
  }
}

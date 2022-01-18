import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../user.service';

@Injectable()
export class ValidateMuiscIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param' && metadata.data === 'music_id') {
      if (!(await this.userService.isExistMusic({ id: parseInt(value) }))) {
        throw new NotFoundException(`music id ${value} is not exist.`);
      }
    }

    return value;
  }
}

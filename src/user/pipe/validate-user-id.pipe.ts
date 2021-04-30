import { PipeTransform, Injectable, ArgumentMetadata, NotFoundException, HttpStatus } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ValidateUserIdPipe implements PipeTransform {
  constructor(private readonly userService: UserService) {}

  async transform(value: number, metadata: ArgumentMetadata) {
    if(metadata.type === 'param' && metadata.data === 'id') {
      if(!(await this.userService.isExistUserFromId(value))) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          error: `user id ${value} is not exist.`
        });
      }
    }
    return value;
  }
}
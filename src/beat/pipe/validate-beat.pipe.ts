import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ErrorString } from 'src/common/const/error-string';
import { ErrorMessage } from '../../common/class/error-message';
import { BeatService } from '../beat.service';

@Injectable()
export class ValidateBeatPipe implements PipeTransform {
  constructor(private readonly beatService: BeatService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param') {
      switch (metadata.data) {
        case 'id':
          if (!(await this.beatService.isExistBeat(value))) {
            throw new NotFoundException(
              new ErrorMessage(
                `beat id ${value} is not exist`,
                ErrorString.FAIL_EXIST,
              ),
            );
          }
          break;
        // case 'comment_id':
        //   if (!(await this.musicService.isExistMusicComment(value))) {
        //     throw new NotFoundException(
        //       new ErrorMessage(
        //         `music comment id ${value} is not exist`,
        //         ErrorString.FAIL_EXIST,
        //       ),
        //     );
        //   }
        //   break;
        default:
          throw new BadRequestException();
      }
    }
    return value;
  }
}

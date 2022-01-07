import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { MusicService } from '../music.service';

@Injectable()
export class ValidateMusicPipe implements PipeTransform {
  constructor(private readonly musicService: MusicService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param') {
      switch (metadata.data) {
        case 'music_id':
          if (!(await this.musicService.isExistMusic(value))) {
            throw new NotFoundException(
                `music id ${value} is not exist`
            );
          }
          break;
        case 'comment_id':
          if (!(await this.musicService.isExistMusicComment(value))) {
            throw new NotFoundException(
                `music comment id ${value} is not exist`
            );
          }
          break;
      }
    }
    return value;
  }
}

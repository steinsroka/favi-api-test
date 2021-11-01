import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Album } from 'src/common/entity/album.entity';
import { UserRequest } from '../../common/@types/user-request';
import { ErrorMessage } from '../../common/class/error-message';
import { ErrorString } from '../../common/const/error-string';
import { UserService } from '../../user/user.service';

@Injectable()
export class AlbumOwnerGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  async canActivate(
    context: ExecutionContext,
  ) {
    const request: UserRequest = context.switchToHttp().getRequest();
    for (const key of Object.keys(request.params)) {
      console.log('guard-key',key);
      switch (key) {
        case 'id':
          break;
        case 'music_id':
          break;
        case 'album_id':
          let album: Album = await this.userService.getAlbum(
            parseInt(request.params.album_id),
          );
          if (request.user.id !== album.user.id) {
            throw new UnauthorizedException(
              new ErrorMessage(
                'you are not authorized to edit different album',
                ErrorString.FAIL_NOT_AUTHORIZED,
              ),
            );
          }
          break;
        default:
          throw new BadRequestException();
      }
    }

    return true;
  }
}

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Album } from 'src/common/entity/album.entity';
import { UserRequest } from '../../common/@types/user-request';
import { UserService } from '../../user/user.service';

@Injectable()
export class AlbumOwnerGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  async canActivate(
    context: ExecutionContext,
  ) {
    const request: UserRequest = context.switchToHttp().getRequest();
    for (const key of Object.keys(request.params)) {

      switch (key) {
        case 'user_id':
          break;
        case 'music_id':
          break;
        case 'album_id':

          let album: Album = await this.userService.getAlbum(
            parseInt(request.params.album_id),
          );

          if(album === undefined){
            throw new NotFoundException(
              'album is not exist'
            )
          }

          if (request.user.id !== album.userId) {
            throw new UnauthorizedException(
                'you are not authorized to edit different album'
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

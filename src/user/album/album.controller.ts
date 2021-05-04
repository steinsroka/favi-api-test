import {
  Controller,
  Get,
  UsePipes,
  UseGuards,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Music } from 'src/music/music.entity';
import { UserIdGuard } from '../guard/user-id.guard';
import { ValidateUserIdPipe } from '../pipe/validate-user-id.pipe';
import { Album } from './album.entity';
import { AlbumService } from './album.service';

@Controller('user/:id/album')
@UsePipes(ValidateUserIdPipe)
@UseGuards(JwtAuthGuard, UserIdGuard)
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get()
  getUserAlbum(@Param('id') userId: number): Promise<Album[]> {
    return this.albumService.getAlbumsFromUserId(userId);
  }

  @Get(':name')
  getUserAlbumContent(@Param('name') name: string): Promise<Music[]> {
    return this.albumService.getAlbumContentFromName(name);
  }

  @Delete(':name')
  @HttpCode(204)
  deleteUserAlbum(
    @Param('id') userId: number,
    @Param('name') name: string,
  ): void {
    this.albumService.deleteAlbum(userId, name);
  }
}

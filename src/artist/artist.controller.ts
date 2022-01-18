import { Controller, Delete, forwardRef, HttpCode, Inject, Param, Put, Request, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserRequest } from '../common/@types/user-request';
import { UserService } from '../user/user.service';
import { ArtistService } from './artist.service';
import { ValidateArtistPipe } from './pipe/validate-artist.pipe';


@ApiTags('Artist(작곡가) 관련 API')
@ApiBearerAuth()
@ApiResponse({
    status: 401,
    description: 'JWT 토큰 만료, 혹은 유저가 해당 권한이 없음',
  })
@UseGuards(JwtAuthGuard)
@UsePipes(ValidateArtistPipe)
@Controller('artist')
export class ArtistController {

    constructor(
        private readonly artistService: ArtistService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
      ) {}
    
    @ApiOperation({ summary: '아티스트에 유저의 좋아요 추가' })
    @ApiParam({
        name: 'artist_id',
        description: '아티스트 ID',
        example: '7',
    })
    @Put(':artist_id/like')
    @HttpCode(204)
    async likeArtist(
        @Request() req: UserRequest,
        @Param('artist_id') artistId: number,
    ): Promise<void> {
        console.log(artistId)
        await this.artistService.addArtistLike(artistId, req.user);
    }

    @ApiOperation({ summary: '아티스트에 유저의 좋아요 삭제' })
    @ApiParam({
        name: 'artist_id',
        description: '아티스트 ID',
        example: '7',
    })
    @ApiResponse({
        status: 204,
        description: '삭제 성공',
    })
    @Delete(':artist_id/like')
    @HttpCode(204)
    async hateArtist(
        @Request() req: UserRequest,
        @Param('artist_id') artistId: number,
    ): Promise<void> {
        await this.artistService.deleteArtistLike(artistId, req.user);
    }
}

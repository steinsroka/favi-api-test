import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtistLike } from '../common/entity/artist-like.entity';
import { Artist } from '../common/entity/artist.entity';
import { User } from '../common/entity/user.entity';

@Injectable()
export class ArtistService {
    constructor(
        @InjectRepository(ArtistLike)
        private readonly ArtistLikeRepository: Repository<ArtistLike>,
        @InjectRepository(Artist)
        private readonly artistRepository: Repository<Artist>,
    ){}

    async addArtistLike(artistId: number, user: User) {
        const likedArtist = await this.artistRepository.findOneOrFail({
          where : {id : artistId}
        })
        const artistLike = await this.ArtistLikeRepository.create({
          likingUser : user,
          likedArtist : likedArtist,
        })
    
        try {
          return await this.ArtistLikeRepository.save(artistLike);
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            // Duplication Entry인 경우, 같은 유저를 두번 블락, 이미 DB에 기록되어 있으므로 이 에러는 무시한다.
            return;
          }
    
          throw new InternalServerErrorException();
        }
      }
    
      async deleteArtistLike(artistId: number, user: User) {
        const likedArtist = await this.artistRepository.findOneOrFail({
          where : {id : artistId}
        })
        return this.ArtistLikeRepository.delete({
          likingUser: user,
          likedArtist: likedArtist
        });
      }

      async isExistArtist(artistId : number){
        return (await this.artistRepository.count({ id: artistId })) > 0;
      }
}

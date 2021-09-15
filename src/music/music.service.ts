import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, InsertResult, Repository } from 'typeorm';
import { Music } from '../common/entity/music.entity';
import { User } from '../common/entity/user.entity';
import { MusicInfo } from '../common/view/music-info.entity';
import { MusicComment } from '../common/entity/music-comment.entity';
import { isDefined } from 'class-validator';
import { MusicLike } from '../common/entity/music-like.entity';
import { MusicCommentLike } from '../common/entity/music-comment-like.entity';
import { MusicTag } from '../common/entity/music-tag.entity';
import { Artist } from '../common/entity/artist.entity';
import { MusicArtist } from '../common/entity/music-artist.entity';
import {
  MusicTagValue,
  Tag,
  TagClass,
} from '../common/entity/music-tag-value.entity';
import { Message } from '../common/class/message';
import { MusicCommentInfo } from '../common/view/music-comment-info.entity';
import { MusicCommentTagDto } from './dto/music-comment-tag.dto';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';

import { EditMusicDto } from './dto/edit-music.dto';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    private readonly musicRepository: Repository<Music>,
    @InjectRepository(MusicInfo)
    private readonly musicInfoRepository: Repository<MusicInfo>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
    @InjectRepository(MusicArtist)
    private readonly musicArtistRepository: Repository<MusicArtist>,
    @InjectRepository(MusicCommentInfo)
    private readonly musicCommentInfoRepository: Repository<MusicCommentInfo>,
    @InjectRepository(MusicComment)
    private readonly musicCommentRepository: Repository<MusicComment>,
    @InjectRepository(MusicLike)
    private readonly musicLikeRepository: Repository<MusicLike>,
    @InjectRepository(MusicCommentLike)
    private readonly musicCommentLikeRepository: Repository<MusicCommentLike>,
    @InjectRepository(MusicTag)
    private readonly musicTagRepository: Repository<MusicTag>,
    @InjectRepository(MusicTagValue)
    private readonly musicTagValueRepository: Repository<MusicTagValue>,
    @InjectRepository(MusicTagInfo)
    private readonly musicTagInfoRepository: Repository<MusicTagInfo>,
  ) {}

  async getMusic(musicId: number, user?: User): Promise<MusicInfo> {
    const music = await this.musicInfoRepository.findOneOrFail({ id: musicId });
    music.tags = await this.getMusicTags(musicId);
    music.myLike = isDefined(user)
      ? await this.isExistMusicLike(musicId, user)
      : null;
    music.artists = await this.getMusicArtists(musicId);
    return music;
  }
  async getMusic2(musicId: number, user?: User): Promise<MusicInfo> {
    const music = await this.musicInfoRepository.findOneOrFail({ id: musicId });
    music.artists = await this.getMusicArtists(musicId);
    return music;
  }
  async addMusic(title: string, composer: string, lyricist: string, album: string, link: string){
    const music = this.musicRepository.create({
      title: title,
      composer: composer,
      lyricist: lyricist,
      album: album,
      link: link
    });
    return this.musicRepository.save(music);
  }

  async getMusics(musicIds: number[]): Promise<MusicInfo[]> {
    const musicInfos = await this.musicInfoRepository.find({where: {id: In(musicIds)}, order: {id: 'ASC'}});
    const tags = await this.musicTagInfoRepository.find({where: {musicId: In(musicIds)}, order: {musicId: 'ASC'}});
    const artists = await this.musicRepository.find({where: {id: In(musicIds)}, relations: ['artists'], order: {id: 'ASC'}});
    let j = 0;
    for(let i = 0; i < musicInfos.length; ++i) {
      musicInfos[i].artists = artists[i].artists;
      musicInfos[i].tags = [];
      while(1) {
        if(j < tags.length && tags[j].musicId === musicInfos[i].id) {
          musicInfos[i].tags.push(tags[j]);
          ++j;
        }
        else {
          break;
        }
      }
    }
    return musicInfos;
  }
  async getMusicWithArtist(artistId: number): Promise<Artist> {
    // const artistInfos = await this.artistRepository.findOneOrFail({where: {id: artistId}});
    const artist = await this.artistRepository.findOneOrFail({
      relations: ['musics'],
      where: { id: artistId },
    });
    const results: MusicTagInfo[] = [];
    const promises = artist.musics.map( async music =>{
      const data = await this.getMusicTags(music.id);
      results.push(data);
      console.log('get-artist-tag-log',data);
    })
     await Promise.all(promises);
    // for (const music of artist.musics) {
    //
    // }
    // console.log('get-artist-tag-log2',results);

    artist.tags = results;
    return artist;
    // artistInfos.musics = await this.musicInfoRepository.find({where: {musicId: In(musicIds)}, order: {musicId: 'ASC'}});
    // return artistInfos;
  }

  async editMusic(musicId: number, editMusicDto: EditMusicDto) {
    const music = await this.musicRepository.findOneOrFail(musicId);
    for (const key of Object.keys(editMusicDto)) {
      music[key] = editMusicDto[key];
    }
    await this.musicRepository.save(music);
    return await this.getMusic(musicId);
  }

  async getMusicArtists(musicId: number): Promise<Artist[]> {
    const music = await this.musicRepository.findOneOrFail({
      relations: ['artists'],
      where: { id: musicId },
    });
    return music.artists;
  }
  // async getArtistMusics(artistId: number): Promise<Artist[]> {
  //   const artist = await this.artistRepository.findOneOrFail({
  //     relations: ['musics'],
  //     where: { artistId: artistId },
  //   });
  //   return artist.musics;
  // }

  async isExistMusic(musicId: number): Promise<boolean> {
    return (await this.musicRepository.count({ id: musicId })) > 0;
  }

  addMusicLike(musicId: number, user: User) {
    const musicLike = this.musicLikeRepository.create({
      userId: user.id,
      musicId: musicId,
    });
    return this.musicLikeRepository.save(musicLike);
  }

  deleteMusicLike(musicId: number, user: User) {
    return this.musicLikeRepository.delete({
      musicId: musicId,
      userId: user.id,
    });
  }

  async isExistMusicLike(musicId: number, user: User): Promise<boolean> {
    return (
      (await this.musicLikeRepository.count({
        musicId: musicId,
        userId: user.id,
      })) > 0
    );
  }

  async isExistMusicCommentLike(
    musicCommentId: number,
    user: User,
  ): Promise<boolean> {
    return (
      (await this.musicCommentLikeRepository.count({
        musicCommentId: musicCommentId,
        userId: user.id,
      })) > 0
    );
  }

  async getMusicComment(
    musicCommentId: number,
    user?: User,
  ): Promise<MusicCommentInfo> {
    const musicComment = await this.musicCommentInfoRepository.findOne({
      id: musicCommentId,
    });
    musicComment.tags = await this.getMusicCommentTags(musicComment.id);
    musicComment.myLike = isDefined(user)
      ? await this.isExistMusicCommentLike(musicComment.id, user)
      : null;
    if (isDefined(musicComment.parentId)) {
      musicComment.parent = await this.getMusicComment(
        musicComment.parentId,
        user,
      );
    }
    return musicComment;
  }

  async getMusicComments(musicId: number, index?: number, user?: User) {
    const musicCommentIndex = isDefined(index) ? 10 : 2;
    index = index ?? 0;
    let limit = musicCommentIndex;
    const musicComments = await this.musicCommentInfoRepository.find({
      where: { musicId: musicId },
      order: { timestamp: 'DESC' },
      skip: index * musicCommentIndex,
      take: limit,
    });
    for (let i = 0; i < musicComments.length; ++i) {
      musicComments[i].tags = await this.getMusicCommentTags(
        musicComments[i].id,
      );
      musicComments[i].myLike = isDefined(user)
        ? await this.isExistMusicCommentLike(musicComments[i].id, user)
        : null;
    }
    return musicComments;
  }

  async isExistMusicComment(musicCommentId: number) {
    return (
      (await this.musicCommentRepository.count({ id: musicCommentId })) > 0
    );
  }

  async addMusicComment(
    musicId: number,
    user: User,
    comment: string,
    parent: number,
  ): Promise<MusicComment> {
    const music = await this.musicRepository.findOneOrFail({
      relations: ['musicComments'],
      where: { id: musicId },
    });
    let parentMusicComment = null;
    if (isDefined(parent)) {
      parentMusicComment = await this.getMusicComment(parent);
    }
    const musicComment = this.musicCommentRepository.create({
      comment: comment,
      user: user,
      parent: parentMusicComment,
    });
    music.musicComments.push(musicComment);
    const newMusic = await this.musicRepository.save(music);
    return newMusic.musicComments.pop();
  }

  async deleteMusicComment(musicCommentId: number): Promise<DeleteResult> {
    return this.musicCommentRepository.delete(musicCommentId);
  }

  async updateMusicComment(
    musicCommentId: number,
    newComment: string,
  ): Promise<MusicComment> {
    const musicComment = await this.musicCommentRepository.findOneOrFail({
      where: { id: musicCommentId },
    });
    musicComment.comment = newComment;
    return this.musicCommentRepository.save(musicComment);
  }

  addMusicCommentLike(musicCommentId: number, user: User) {
    const musicCommentLike = this.musicCommentLikeRepository.create({
      musicCommentId: musicCommentId,
      userId: user.id,
    });
    return this.musicCommentLikeRepository.save(musicCommentLike);
  }

  deleteMusicCommentLike(
    musicCommentId: number,
    user: User,
  ): Promise<DeleteResult> {
    return this.musicCommentLikeRepository.delete({
      musicCommentId: musicCommentId,
      userId: user.id,
    });
  }

  async getMusicTags(
    musicId: number,
    tagClass?: TagClass,
  ): Promise<MusicTagInfo[]> {
    return await this.musicTagInfoRepository.find({ musicId: musicId });
  }

  async getMusicCommentTags(
    musicCommentId: number,
  ): Promise<MusicCommentTagDto[]> {
    return await this.musicTagRepository
      .createQueryBuilder('musicTag')
      .select('value.name', 'name')
      .addSelect('value.class', 'class')
      .addSelect('value.parent', 'parent')
      .leftJoin('musicTag.musicTagValue', 'value')
      .where('musicCommentId = :id', { id: musicCommentId })
      .groupBy('value.name')
      .getRawMany();
  }

  async addMusicTag(
    musicId: number,
    tag: Tag,
    user: User,
    musicCommentId?: number,
  ): Promise<InsertResult> {
    const musicTagValue = await this.musicTagValueRepository.findOneOrFail({
      where: { name: tag },
    });
    return this.musicTagRepository.insert({
      musicId: musicId,
      musicCommentId: musicCommentId,
      userId: user.id,
      musicTagValueId: musicTagValue.id,
    });
  }

  async getUserDistributionInMusic(id: number) {
    const ratioAge =
      (await this.musicLikeRepository
        .createQueryBuilder('ratioAge')
        .select('musicId', 'musicId')
        .addSelect(
          'COUNT(case when user.age = 10 then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          '10',
        )
        .addSelect(
          'COUNT(case when user.age = 20 then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          '20',
        )
        .addSelect(
          'COUNT(case when user.age = 30 then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          '30',
        )
        .addSelect(
          'COUNT(case when user.age = 40 then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          '40',
        )
        .addSelect(
          'COUNT(case when user.age = 50 then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          '50',
        )
        .leftJoin(User, 'user', 'ratioAge.userId = user.id')
        .where('ratioAge.musicId = :id', { id: id })
        .getRawOne()) ?? null;

    const ratioGender =
      (await this.musicLikeRepository
        .createQueryBuilder('ratioAge')
        .select('musicId', 'musicId')
        .addSelect(
          'COUNT(case when user.gender = "men" then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          'men',
        )
        .addSelect(
          'COUNT(case when user.gender = "women" then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          'women',
        )
        .addSelect(
          'COUNT(case when user.gender = "default" then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          'other',
        )
        .leftJoin(User, 'user', 'ratioAge.userId = user.id')
        .where('ratioAge.musicId = :id', { id: id })
        .getRawOne()) ?? null;

    return [
      {
        type: 'age',
        result: ratioAge,
      },
      {
        type: 'gender',
        result: ratioGender,
      },
    ];
  }
}

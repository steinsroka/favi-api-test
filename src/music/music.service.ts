import {
  Injectable,
  InternalServerErrorException,
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
import { MusicTagValue, Tag } from '../common/entity/music-tag-value.entity';
import { MusicCommentInfo } from '../common/view/music-comment-info.entity';
import { MusicCommentTagDto } from './dto/music-comment-tag.dto';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';

import { EditMusicDto } from './dto/edit-music.dto';
import { MusicWithLikeDto } from './dto/music-with-like.dto';
import { ArtistLike } from '../common/entity/artist-like.entity';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    private readonly musicRepository: Repository<Music>,
    @InjectRepository(MusicInfo)
    private readonly musicInfoRepository: Repository<MusicInfo>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
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
    @InjectRepository(ArtistLike)
    private readonly artistLikeRepository : Repository<ArtistLike>,
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
  async addMusic(
    title: string,
    composer: string,
    lyricist: string,
    album: string,
    link: string,
  ) {
    const music = this.musicRepository.create({
      title: title,
      composer: composer,
      lyricist: lyricist,
      album: album,
      link: link,
    });
    return this.musicRepository.save(music);
  }

  //needResponseTags : 0 : response에 태그 필요없음, 1 : 태그 필요함
  async getMusics(
    musicIds: number[],
    needReseponseTags: number,
  ): Promise<MusicInfo[]> {
    const musicInfos = await this.musicInfoRepository.find({
      where: { id: In(musicIds) },
      order: { id: 'ASC' },
    });
    const artists = await this.musicRepository.find({
      where: { id: In(musicIds) },
      relations: ['artists'],
      order: { id: 'ASC' },
    });
    if (needReseponseTags === 1) {
      // 태그 정보까지 넣어줌
      const tags = await this.musicTagInfoRepository.find({
        where: { musicId: In(musicIds) },
        order: { musicId: 'ASC' },
      });
      let j = 0;
      for (let i = 0; i < musicInfos.length; ++i) {
        musicInfos[i].artists = artists[i].artists;
        musicInfos[i].tags = [];
        while (1) {
          if (j < tags.length && tags[j].musicId === musicInfos[i].id) {
            musicInfos[i].tags.push(tags[j]);
            ++j;
          } else {
            break;
          }
        }
      }
    } else {
      const j = 0;
      for (let i = 0; i < musicInfos.length; ++i) {
        musicInfos[i].artists = artists[i].artists;
      }
    }
    return musicInfos;
  }
  async getMusicWithArtist(artistId: number, user?: User): Promise<Artist> {
    const artist : any = await this.artistRepository.findOneOrFail({
      where: { id: artistId },
    });
    
    const artistLikedCount : number = await this.artistLikeRepository.count({
      where : {likedArtist : artist}
    });

    const musicWithLikes: MusicWithLikeDto[] = await this.artistRepository
      .createQueryBuilder('a')
      .select('m.*')
      .addSelect('if(isnull(l.userId),false, true)', 'myLike')
      .innerJoin('music_artists_artist', 'ma', 'a.id = ma.artistId')
      .innerJoin(Music, 'm', 'm.id = ma.musicId')
      .leftJoin(MusicLike, 'l', 'l.userId= :userId and l.musicId=m.id', {
        userId: user.id,
      })
      .where('a.id = :artistId', { artistId: artistId })
      .getRawMany();

    musicWithLikes.map((item) => {
      item.myLike == 0 ? (item.myLike = false) : (item.myLike = true);
      return item;
    });


    artist.LikedUserCount = artistLikedCount;
    artist.musics = musicWithLikes;

    return artist;
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

  async isExistMusic(musicId: number): Promise<boolean> {
    return (await this.musicRepository.count({ id: musicId })) > 0;
  }

  async isValidComment(musicId: number, commentId: number): Promise<boolean> {
    return (
      (await this.musicCommentInfoRepository.count({
        id: commentId,
        musicId: musicId,
      })) > 0
    );
  }

  async addMusicLike(musicId: number, user: User) {
    const musicLike = await this.musicLikeRepository.create({
      userId: user.id,
      musicId: musicId,
    });
    return this.musicLikeRepository.save(musicLike);
  }

  async deleteMusicLike(musicId: number, user: User) {
    return await this.musicLikeRepository.delete({
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
    // 10개씩 가져옴
    const stride = 10;
    // index 정의되어 있지 않으면 index = 0
    if (isNaN(index)) {
      index = 0;
    }

    const musicComments = await this.musicCommentInfoRepository.find({
      where: { musicId: musicId },
      order: { timestamp: 'DESC' },
      skip: index * stride,
      take: stride,
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
    // 해당 Music ID 서버에서 찾음
    const music = await this.musicRepository.findOneOrFail({
      relations: ['musicComments'],
      where: { id: musicId },
    });

    // parent는 기본 Null, 만약 parent 정의되어 있으면 (대댓글이면) 부모 댓글 가져옴
    let parentMusicComment = null;
    if (isDefined(parent)) {
      parentMusicComment = await this.getMusicComment(parent);
    }

    // 댓글 추가
    const musicComment = this.musicCommentRepository.create({
      comment: comment,
      user: user,
      parent: parentMusicComment,
    });

    // 찾아온 음악에 push
    music.musicComments.push(musicComment);
    const newMusic = await this.musicRepository.save(music);
    // 이후 Comment 반환
    return newMusic.musicComments.pop();
  }

  async deleteMusicComment(
    musicId: number,
    commentId: number,
  ): Promise<DeleteResult> {
    const DeleteComment = await this.musicCommentRepository.findOne({
      id: commentId,
      musicId: musicId,
    });
    // 대댓글 먼저 삭제
    await this.musicCommentRepository.createQueryBuilder()
    .delete()
    .where("parentId = :parentId and musicId = :musicId", {parentId: DeleteComment.id, musicId : musicId })
    .execute();

    // 그 뒤 댓글 삭제
    return this.musicCommentRepository.delete({
      id : commentId,
      musicId : musicId
    })
  }

  async updateMusicComment(
    musicId: number,
    musicCommentId: number,
    newComment: string,
  ): Promise<MusicComment> {
    try {
      const musicComment = await this.musicCommentRepository.findOneOrFail({
        where: { id: musicCommentId, musicId: musicId },
      });
      musicComment.comment = newComment;
      return this.musicCommentRepository.save(musicComment);
    } catch {
      throw new NotFoundException('Music id or comment id is not valid');
    }
  }

  addMusicCommentLike(musicId: number, musicCommentId: number, user: User) {
    if (!this.isValidComment(musicId, musicCommentId)) {
      throw new NotFoundException('Music id or comment id is not valid');
    }

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

  async getMusicTags(musicId: number): Promise<MusicTagInfo[]> {
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
          'COUNT(case when user.age = "10" then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          '10',
        )
        .addSelect(
          'COUNT(case when user.age = "20" then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          '20',
        )
        .addSelect(
          'COUNT(case when user.age = "30" then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          '30',
        )
        .addSelect(
          'COUNT(case when user.age = "40" then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
          '40',
        )
        .addSelect(
          'COUNT(case when user.age = "50" then 1 ELSE NULL END) OVER(PARTITION BY musicId) / COUNT(*) OVER(PARTITION BY musicId) * 100',
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

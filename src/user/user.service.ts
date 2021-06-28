import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { keys } from 'ts-transformer-keys';
import { Repository, DeleteResult } from 'typeorm';
import { UserPartialDto } from './dto/user-partial.dto';
import { User } from '../common/entity/user.entity';
import { UserInfo } from '../common/view/user-info.entity';
import { MusicCommentTagDto } from '../music/dto/music-comment-tag.dto';
import { UserTagInfo } from '../common/view/user-tag-info.entity';
import { MusicLike } from '../common/entity/music-like.entity';
import { Music } from '../common/entity/music.entity';
import { MusicSmallInfoDto } from '../music/dto/music-small-info.dto';
import { Tag, TagClass } from '../common/entity/music-tag-value.entity';
import { MusicTagInfo } from 'src/common/view/music-tag-info.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    @InjectRepository(UserTagInfo)
    private readonly userTagInfoRepository: Repository<UserTagInfo>,
    @InjectRepository(MusicLike)
    private readonly userMusicLikeRepository: Repository<MusicLike>
  ) {}

  getUserInfo(userId: number): Promise<UserInfo> {
    return this.userInfoRepository.findOneOrFail({ id: userId });
  }

  async getUserTags(userId: number): Promise<UserTagInfo[]> {
    return await this.userTagInfoRepository.find({ where: { userId: userId } });
  }

  deleteUser(userId: number): Promise<DeleteResult> {
    return this.userRepository.softDelete(userId);
  }

  getUserAuthInfo(userPartial: UserPartialDto): Promise<User> {
    return this.userRepository.findOneOrFail({
      where: userPartial,
    });
  }

  saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async isExistUser(userPartial: UserPartialDto): Promise<boolean> {
    return (await this.userRepository.count({ where: userPartial })) > 0;
  }

  getUserLikedAllMusic(userId: number): Promise<MusicSmallInfoDto[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .select('music.id', 'id')
      .addSelect('music.title', 'title')
      .addSelect('music.composer', 'composer')
      .innerJoin('user.musicLikes', 'musicLikes')
      .leftJoin('musicLikes.music', 'music')
      .where('user.id = :userId', { userId: userId })
      .getRawMany();
  }

  async getUserLikedTagMusic(userId: number, tag: Tag): Promise<MusicSmallInfoDto[]> {
    return this.userMusicLikeRepository
    .createQueryBuilder('musicLike')
    .select('music.id', 'id')
    .addSelect('music.title', 'title')
    .addSelect('music.composer', 'composer')
    .leftJoin(MusicTagInfo, 'musicTagInfo', 'music_like.musicId = music_tag_info.musicId')
    .leftJoin(Music,'music','music_like.musicId = music.id')
    .where('musicLike.userId = :userId', {userId : userId})
    .andWhere('musicTagInfo.rank <= 3')
    .andWhere('musicTagInfo.name = :tag', {tag:tag})
    .getRawMany();
  }
}

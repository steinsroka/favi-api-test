import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { keys } from 'ts-transformer-keys';
import {
  Repository,
  DeleteResult,
  In,
  getRepository,
  createQueryBuilder,
} from 'typeorm';
import { UserPartialDto } from './dto/user-partial.dto';
import { AlbumPartialDto } from './dto/album-partial.dto';
import { User } from '../common/entity/user.entity';
import { UserInfo } from '../common/view/user-info.entity';
import { MusicCommentTagDto } from '../music/dto/music-comment-tag.dto';
import { UserTagInfo } from '../common/view/user-tag-info.entity';
import { MusicLike } from '../common/entity/music-like.entity';
import { Music } from '../common/entity/music.entity';
import { MusicSmallInfoDto } from '../music/dto/music-small-info.dto';
import { Tag, TagClass } from '../common/entity/music-tag-value.entity';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';
import { Album } from '../common/entity/album.entity';
import { UserLikedAlbumDto } from './dto/user-liked-album.dto';
import { SocialLog } from '../common/view/social-log.entity';
import { max, min } from 'class-validator';
import { MusicInfo } from '../common/view/music-info.entity';
import { TesterProceedDto } from './dto/tester-remain.dto';

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
    private readonly userMusicLikeRepository: Repository<MusicLike>,
    @InjectRepository(Album)
    private readonly userAlbumRepository: Repository<Album>,
    @InjectRepository(Music)
    private readonly userMusicRepository: Repository<Music>,
    @InjectRepository(MusicInfo)
    private readonly musicInfoRepository: Repository<MusicInfo>,
    @InjectRepository(SocialLog)
    private readonly socialLogRepository: Repository<SocialLog>,
  ) {}

  async getUserInfo(userId: number): Promise<UserInfo> {
    const user = await this.userInfoRepository.findOneOrFail({ id: userId });
    user.tags = await this.getUserTags(userId);
    return user;
  }

  async getUserTags(userId: number): Promise<UserTagInfo[]> {
    return await this.userTagInfoRepository.find({ where: { userId: userId } });
  }

  deleteUser(userId: number): Promise<DeleteResult> {
    return this.userRepository.delete(userId);
  }

  getUserAuthInfo(userPartial: UserPartialDto): Promise<User> {
    return this.userRepository.findOne({
      where: userPartial,
    });
  }

  saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async isExistUser(userPartial: UserPartialDto): Promise<boolean> {
    return (await this.userRepository.count({ where: userPartial })) > 0;
  }

  async getUserLikedAllMusic(userId: number): Promise<Music[]> {
    const musicLikes = await this.userMusicLikeRepository.find({
      userId: userId,
    });
    return this.userMusicRepository.find({
      where: { id: In(musicLikes.map((value) => value.musicId)) },
      relations: ['artists'],
    });
  }

  async getUserLikedTagMusic(userId: number, tag: Tag): Promise<Music[]> {
    const musicLikes: MusicSmallInfoDto[] = await this.userMusicLikeRepository
      .createQueryBuilder('musicLike')
      .select('music.id', 'id')
      .addSelect('music.title', 'title')
      .addSelect('musicLike.timestamp', 'timestamp')
      .leftJoin(
        MusicTagInfo,
        'musicTagInfo',
        'musicLike.musicId = musicTagInfo.musicId',
      )
      .leftJoin(Music, 'music', 'musicLike.musicId = music.id')
      .where('musicLike.userId = :userId', { userId: userId })
      .andWhere('musicTagInfo.rank <= 3')
      .andWhere('musicTagInfo.name = :tag', { tag: tag })
      .orderBy('musicLike.timestamp','DESC')
      .getRawMany();
    return this.userMusicRepository.find({
      where: { id: In(musicLikes.map((value) => value.id)) },
      relations: ['artists']
    });
  }

  async getNearUsers(userId: number): Promise<number[]> {
    const users = await this.getUserTags(userId);
    const tags = [];
    for (let i = 0; i < Math.min(3, users.length); ++i) {
      tags.push(users[i].name);
    }
    const nearUsers = await createQueryBuilder()
      .select('t.userId', 'userId')
      .addSelect(`MAX(t.weight)`, 'weight')
      .addSelect('MAX(socialLog.timestamp)', 'recentSocialLogTimestamp')
      .from(
        (qb) =>
          qb
            .select('userTagInfo.userId', 'userId')
            .addSelect(`SUM(${'`name`'} IN("${tags.join('","')}"))`, 'weight')
            .from(UserTagInfo, 'userTagInfo')
            .where('`rank` <= 3')
            .groupBy('userTagInfo.userId')
            .orderBy('weight', 'DESC'),
        't',
      )
      .leftJoin(SocialLog, 'socialLog', 't.userId = socialLog.userId')
      .groupBy('t.userId')
      .orderBy('t.weight', 'DESC')
      .addOrderBy('recentSocialLogTimestamp', 'DESC')
      .limit(10)
      .getRawMany();


    const ret: number[] = [];
    for (const i of nearUsers) {
      ret.push(i.userId);
    }

    return ret;
  }

  getSocialLogs(
    userIds: number[],
    index: number = 0,
  ): Promise<SocialLog[]> {
    return this.socialLogRepository.find({
      where: { userId: In(userIds) },
      order: { timestamp: 'DESC' },
      take: 10,
      skip: index * 10,
    });
  }

  async getUserLikedAlbums(id: number): Promise<UserLikedAlbumDto[]> {
    const albums: UserLikedAlbumDto[] = await this.userMusicLikeRepository
      .createQueryBuilder('musicLike')
      .select('musicTagInfo.name', 'name')
      .addSelect('musicTagInfo.class', 'class')
      .addSelect('musicTagInfo.parent', 'parent')
      .addSelect('COUNT(*) OVER(PARTITION BY musicTagInfo.name)', 'count')
      .addSelect('musicTagInfo.musicId', 'musicId')
      .leftJoin(
        MusicTagInfo,
        'musicTagInfo',
        'musicLike.musicId = musicTagInfo.musicId',
      )
      .where('musicTagInfo.rank <= 3')
      .andWhere('musicLike.userId = :userId', { userId: id })
      .orderBy('musicLike.timestamp', 'DESC')
      .getRawMany();
    const result: UserLikedAlbumDto[] = [];
    const existInAlbum: Map<Tag, boolean> = new Map<Tag, boolean>();
    for (const key of albums) {
      if (!existInAlbum.has(key.name)) {
        result.push(key);
        existInAlbum.set(key.name, true);
      }
    }
    return result;
  }

  async addAlbum(userId: number, albumName: string, isPublic: boolean) {
    const user: User = await this.userRepository.findOne({ id: userId });
    const album = this.userAlbumRepository.create({
      name: albumName,
      isPublic: isPublic,
      user: user,
    });

    return this.userAlbumRepository.save(album);
  }

  async getAlbum(albumId: number): Promise<Album> {
    return await this.userAlbumRepository.findOne({ id: albumId });
  }
  async getAlbums(userId: number): Promise<Album[]> {
    const user = await this.userRepository.findOne({ id: userId });
    return user.albums;
  }

  async isExistAlbum(albumPartial: AlbumPartialDto): Promise<boolean> {
    return (await this.userAlbumRepository.count({ where: albumPartial })) > 0;
  }

  //아래의 메소드들은 유저가 앨범을 가지고 있는지는 controller에서 guard를 통해 할 예정
  //getMusicsInAlbum, addMusicInAlbum, updateAlbum, deleteAlbum, deleteMusicInAlbum

  async getMusicsInAlbum(userId: number, albumId: number): Promise<Music[]> {
    const album = await this.userAlbumRepository.findOne({ id: albumId });
    return album.musics;
  }

  async addMusicInAlbum(albumId: number, musicId: number) {
    let album = await this.userAlbumRepository.findOne({ id: albumId });
    album.musics.push(await this.userMusicRepository.findOne({ id: musicId }));
    return this.userAlbumRepository.save(album);
  }

  async updateAlbum(albumId: number, newName: string, isPublic: boolean) {
    let album = await this.userAlbumRepository.findOne({ id: albumId });
    album.name = newName;
    album.isPublic = isPublic;
    return this.userAlbumRepository.save(album);
  }

  async deleteAlbum(albumId: number): Promise<DeleteResult> {
    return await this.userAlbumRepository.softDelete(albumId);
  }

  async deleteMusicInAlbum(albumId: number, musicId: number) {
    let album = await this.userAlbumRepository.findOne({ id: albumId });
    const findMusicIdx = album.musics.findIndex((music) => {
      return music.id === musicId;
    });
    if (findMusicIdx > -1) album.musics.splice(findMusicIdx, 1);
    return this.userAlbumRepository.save(album);
  }

  async getTesterMusics(
    user: User,
    index: number,
    size: number,
  ): Promise<Music[]> {
    index = parseInt(index.toString());
    size = parseInt(size.toString());
    return (
      await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['testerMusics'],
      })
    ).testerMusics.slice(index * size, index * size + size);
  }

  async getTesterMusicCount(user: User): Promise<TesterProceedDto> {
    return {
      remain: (
        await this.userRepository
          .createQueryBuilder('user')
          .select('COUNT(testerMusics.musicId)', 'remain')
          .leftJoin(
            'tester_music',
            'testerMusics',
            'user.id = testerMusics.userId',
          )
          .where('user.id = :userId', { userId: user.id })
          .getRawOne()
      ).remain,
      total: (await this.userRepository.findOne(user.id)).totalTesterMusicCount,
    };
  }

  async isExistTesterMusic(user: User, musicId: number): Promise<boolean> {
    const tester = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['testerMusics'],
    });
    for (const music of tester.testerMusics) {
      if (music.id.toString() === musicId.toString()) {
        return true;
      }
    }
    return false;
  }

  async deleteTesterMusic(user: User, musicId: number) {
    const tester = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['testerMusics'],
    });
    tester.testerMusics = tester.testerMusics.filter(
      (value) => value.id.toString() !== musicId.toString(),
    );
    await this.userRepository.save(tester);
    return tester.testerMusics;
  }
}

import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, In, createQueryBuilder } from 'typeorm';
import { UserPartialDto } from './dto/user-partial.dto';
import { AlbumPartialDto } from './dto/album-partial.dto';
import { User } from '../common/entity/user.entity';
import { UserInfo } from '../common/view/user-info.entity';
import { UserTagInfo } from '../common/view/user-tag-info.entity';
import { UserFollow } from '../common/entity/user-follow.entity';
import { MusicLike } from '../common/entity/music-like.entity';
import { Music } from '../common/entity/music.entity';
import { MusicSmallInfoDto } from '../music/dto/music-small-info.dto';
import { MusicTagValue, Tag } from '../common/entity/music-tag-value.entity';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';
import { Album } from '../common/entity/album.entity';
import { UserLikedAlbumDto } from './dto/user-liked-album.dto';
import { SocialLog } from '../common/view/social-log.entity';
import { MusicInfo } from '../common/view/music-info.entity';
import { TesterProceedDto } from './dto/tester-remain.dto';
import { MusicPartialDto } from './dto/music-partial.dto';
import { userCommentDto } from './dto/user-comment.dto';
import { AlbumResponseDto } from './dto/album-response.dto';
import { updateAlbumDto } from './dto/update-album.dto';
import { UserBlock } from '../common/entity/user-block.entity';
import { MusicComment } from '../common/entity/music-comment.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    @InjectRepository(UserTagInfo)
    private readonly userTagInfoRepository: Repository<UserTagInfo>,
    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,
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
    @InjectRepository(MusicComment)
    private readonly musicCommentRepository: Repository<MusicComment>,
    @InjectRepository(MusicTagValue)
    private readonly musicTagValueRepository: Repository<MusicTagValue>,
    @InjectRepository(UserBlock)
    private readonly userBlockRepository: Repository<UserBlock>,
  ) {}

  async getUserInfo(userId: number): Promise<UserInfo> {
    const user = await this.userInfoRepository.findOneOrFail({ id: userId });
    user.tags = await this.getUserTags(userId);
    return user;
  }

  // specificUser가 Define 되어 있다면 tag, 내가 팔로우했는지 돌려줌, 없다면 제외
  async getSocialUserInfo(
    myId: number,
    specificUserId: number,
    needTags: boolean,
    needFollowInfo: boolean,
  ): Promise<UserInfo> {
    const user = await this.userInfoRepository.findOneOrFail({
      id: specificUserId,
    });
    if (needTags) {
      user.tags = await this.getUserTags(specificUserId);
    }

    if (needFollowInfo) {
      const followInfo = await this.userFollowRepository.findOne({
        where: { userId: myId, followUserId: specificUserId },
      });

      if (followInfo) {
        user.followedByMe = true;
      } else {
        user.followedByMe = false;
      }
    }
    return user;
  }

  async getUserTags(userId: number): Promise<UserTagInfo[]> {
    return await this.userTagInfoRepository.find({ where: { userId: userId } });
  }

  deleteUser(userId: number): Promise<DeleteResult> {
    return this.userRepository.delete(userId);
  }

  async getUserAuthInfo(userPartial: UserPartialDto): Promise<User> {
    const data: User = await this.userRepository
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .addSelect('user.email', 'email')
      .addSelect('user.password', 'password')
      .addSelect('user.pw_salt', 'pwSalt')
      .where(userPartial)
      .getRawOne();

    return data;
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
      .orderBy('musicLike.timestamp', 'DESC')
      .getRawMany();

    return this.userMusicRepository.find({
      where: { id: In(musicLikes.map((value) => value.id)) },
      relations: ['artists'],
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

  async getSocialLogs(userIds: number[], index = 0): Promise<SocialLog[]> {
    return await this.socialLogRepository.find({
      where: { userId: In(userIds) },
      order: { timestamp: 'DESC' },
      take: 5,
      skip: index * 5,
    });
  }

  async getUserComments(
    userId: number,
    index: number,
    size: number,
  ): Promise<userCommentDto[]> {
    const comments: userCommentDto[] = await this.musicCommentRepository
      .createQueryBuilder('c')
      .select('c.comment', 'commentContents')
      .addSelect('m.id', 'musicId')
      .addSelect('c.timestamp', 'timestamp')
      .addSelect('m.title', 'musicName')
      .addSelect('a.name', 'artistName')
      .addSelect('count(l.userId)', 'likedCount')
      .addSelect('count(rc.comment)', 'reCommentCount')
      .innerJoin('music', 'm', 'c.musicId=m.id')
      .innerJoin('music_artists_artist', 'ma', 'm.id = ma.musicId')
      .innerJoin('artist', 'a', 'ma.artistId = a.id')
      .leftJoin('music_comment_like', 'l', 'l.musicCommentId = c.id')
      .leftJoin('music_comment', 'rc', 'rc.parentId = c.id')
      .where('c.userId = :userId', { userId: userId })
      .groupBy('c.comment, c.timestamp, m.title, a.name, m.id')
      .orderBy('c.timestamp', 'DESC')
      .limit(size)
      .offset(index * size)
      .getRawMany();
    return comments;
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

  async addAlbum(
    userId: number,
    albumName: string,
    isPublic: boolean,
    tagsName: Tag[],
  ) {
    const user: User = await this.userRepository.findOne({ id: userId });
    // tagsName 배열이 빈 배열일때 예외 처리
    if (Array.isArray(tagsName) && tagsName.length == 0) {
      tagsName = null;
    }
    const tags: MusicTagValue[] = await this.musicTagValueRepository
      .createQueryBuilder('tags')
      .where('tags.name in (:tagsName)', { tagsName: tagsName })
      .getMany();

    const album = this.userAlbumRepository.create({
      name: albumName,
      isPublic: isPublic,
      user: user,
      tags: tags,
    });

    return this.userAlbumRepository.save(album);
  }

  async getAlbum(albumId: number): Promise<Album> {
    return await this.userAlbumRepository.findOne({ id: albumId });
  }

  async getAlbums(userId: number): Promise<AlbumResponseDto[]> {
    const user = await this.userRepository.findOne({ id: userId });
    const albums = await this.userAlbumRepository.find({
      relations: ['tags', 'musics'],
      where: { user: user },
    });

    const response: AlbumResponseDto[] = [];

    albums.map((item) => {
      if (item.musics.length > 0) {
        const representImageId = item.musics[0].id;
        const musicCount = item.musics.length;
        delete item.musics;
        response.push({
          ...item,
          representImageId: representImageId,
          musicCount: musicCount,
        });
        return;
      }
      delete item.musics;
      response.push({ ...item, representImageId: null, musicCount: 0 });
    });
    return response;
  }

  async isExistAlbum(albumPartial: AlbumPartialDto): Promise<boolean> {
    return (await this.userAlbumRepository.count({ where: albumPartial })) > 0;
  }

  async isExistMusic(musicPartial: MusicPartialDto): Promise<boolean> {
    return (await this.userMusicRepository.count({ where: musicPartial })) > 0;
  }

  //아래의 메소드들은 유저가 앨범을 가지고 있는지는 controller에서 guard를 통해 할 예정
  //getMusicsInAlbum, addMusicInAlbum, updateAlbum, deleteAlbum, deleteMusicInAlbum

  async getMusicsInAlbum(userId: number, albumId: number): Promise<Music[]> {
    const album = await this.userAlbumRepository.findOneOrFail({
      relations: ['musics'],
      where: { id: albumId },
    });
    return album.musics;
  }

  async addMusicInAlbum(albumId: number, musicId: number) {
    // console.log('album-music ready');
    const album = await this.userAlbumRepository.findOneOrFail({
      relations: ['musics'],
      where: { id: albumId },
    });
    // console.log('album-music album',album);
    const musics = await this.userMusicRepository.findOne({ id: musicId });
    // console.log('album-music musics',musics);
    album.musics.push(await this.userMusicRepository.findOne({ id: musicId }));

    return this.userAlbumRepository.save(album);
  }

  async updateAlbum(albumId: number, updateAlbum: updateAlbumDto) {
    let album = await this.userAlbumRepository.findOneOrFail({
      relations: ['musics'],
      where: { id: albumId },
    });

    const { tags, ...withoutTagsDto } = updateAlbum;

    album = Object.assign(album, withoutTagsDto);

    const findTags = await this.musicTagValueRepository.find({
      where: { name: In(tags) },
    });

    album.tags = findTags;

    return this.userAlbumRepository.save(album);
  }

  async deleteAlbum(albumId: number): Promise<DeleteResult> {
    // console.log('delete-callback');
    return this.userAlbumRepository.softDelete(albumId);
  }

  async deleteMusicInAlbum(albumId: number, musicId: number) {
    const album = await this.userAlbumRepository.findOneOrFail({
      where: { id: albumId },
      relations: ['musics'],
    });
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

  async getUserFollow(followId: number) {
    const followingUser = await this.userFollowRepository.find({
      userId: followId,
    });
    const followedUser = await this.userFollowRepository.find({
      followUserId: followId,
    });

    const followingUserIdArray = followingUser.map((item) => item.followUserId);
    const followedUserIdArray = followedUser.map((item) => item.userId);

    const followingUserData = await this.userRepository.find({
      where: { id: In(followingUserIdArray) },
    });
    const followedUserData = await this.userRepository.find({
      where: { id: In(followedUserIdArray) },
    });
    return { followingUser: followingUserData, followedUser: followedUserData };
  }

  async addUserFollow(followId: number, user: User) {
    const userFollow = this.userFollowRepository.create({
      userId: user.id,
      followUserId: followId,
    });
    return this.userFollowRepository.save(userFollow);
  }

  async deleteUserFollow(followId: number, user: User) {
    return this.userFollowRepository.delete({
      followUserId: followId,
      userId: user.id,
    });
  }

  async addUserBlock(blockedUserId: number, user: User) {
    const blockedUser = await this.userRepository.findOneOrFail({
      where: { id: blockedUserId },
    });

    const userBlock = await this.userBlockRepository.create({
      blockingUser: user,
      blockedUser: blockedUser,
    });
    try {
      return await this.userBlockRepository.save(userBlock);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        // Duplication Entry인 경우, 같은 유저를 두번 블락, 이미 DB에 기록되어 있으므로 이 에러는 무시한다.
        return;
      }

      throw new InternalServerErrorException();
    }
  }

  async deleteUserBlock(blockedUserId: number, user: User) {
    const blockedUser = await this.userRepository.findOneOrFail({
      where: { id: blockedUserId },
    });
    return this.userBlockRepository.delete({
      blockingUser: user,
      blockedUser: blockedUser,
    });
  }

  async getUserBlock(user: User): Promise<number[]> {
    const blockingUserRawData = await this.userBlockRepository
      .createQueryBuilder('b')
      .select('b.blockedUserId')
      .where('b.blockingUserId = :currentUserId', { currentUserId: user.id })
      .getRawMany();

    const blockingUserArray: number[] = [];

    blockingUserRawData.map((item) => {
      blockingUserArray.push(item.blockedUserId);
    });

    return blockingUserArray;
  }

  async isExistUserFollow(followId: number, user: User): Promise<boolean> {
    return (
      (await this.userFollowRepository.count({
        followUserId: followId,
        userId: user.id,
      })) > 0
    );
  }
  async getUserAllFollower(userId: number): Promise<number[]> {
    const userFollowers = await this.userFollowRepository.find({
      userId: userId,
    });
    const ret: number[] = [];
    for (const i of userFollowers) {
      ret.push(i.followUserId);
    }

    return ret;
  }
}

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
import { MusicTagInfo } from '../common/view/music-tag-info.entity';
import { Album } from '../common/entity/album.entity';

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

  async getUserLikedTagMusic(
    userId: number,
    tag: Tag,
  ): Promise<MusicSmallInfoDto[]> {
    return this.userMusicLikeRepository
      .createQueryBuilder('musicLike')
      .select('music.id', 'id')
      .addSelect('music.title', 'title')
      .addSelect('music.composer', 'composer')
      .leftJoin(
        MusicTagInfo,
        'musicTagInfo',
        'musicLike.musicId = musicTagInfo.musicId',
      )
      .leftJoin(Music, 'music', 'musicLike.musicId = music.id')
      .where('musicLike.userId = :userId', { userId: userId })
      .andWhere('musicTagInfo.rank <= 3')
      .andWhere('musicTagInfo.name = :tag', { tag: tag })
      .getRawMany();
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

  async getAlbums(userId: number): Promise<Album[]> {
    const user = await this.userRepository.findOne({ id: userId });
    return user.albums;
  }

  //아래의 메소드들은 유저가 앨범을 가지고 있는지는 controller에서 guard를 통해 할 예정
  //getMusicsInAlbum, addMusicInAlbum, updateAlbum, deleteAlbum

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
}

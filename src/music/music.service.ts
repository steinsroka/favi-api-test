import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository } from 'typeorm';
import { Music } from '../common/entity/music.entity';
import { User } from '../common/entity/user.entity';
import { MusicInfo } from '../common/view/music-info.entity';
import { MusicComment } from '../common/entity/music-comment.entity';
import { isDefined } from 'class-validator';
import { MusicLike } from '../common/entity/music-like.entity';
import { MusicCommentLike } from '../common/entity/music-comment-like.entity';
import { MusicTag } from '../common/entity/music-tag.entity';
import {
  MusicTagValue,
  Tag,
  TagClass,
} from '../common/entity/music-tag-value.entity';
import { Message } from '../common/class/message';
import { MusicCommentInfo } from '../common/view/music-comment-info.entity';
import { MusicCommentTagDto } from './dto/music-comment-tag.dto';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    private readonly musicRepository: Repository<Music>,
    @InjectRepository(MusicInfo)
    private readonly musicInfoRepository: Repository<MusicInfo>,
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

  getMusic(musicId: number): Promise<MusicInfo> {
    return this.musicInfoRepository.findOneOrFail({ id: musicId });
  }

  async isExistMusic(musicId: number): Promise<boolean> {
    return (await this.musicInfoRepository.count({ id: musicId })) > 0;
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

  async isExistMusicLike(musicId: number, user: User) {
    return (
      (await this.musicLikeRepository.count({
        musicId: musicId,
        userId: user.id,
      })) > 0
    );
  }

  async getMusicComment(musicId: number): Promise<MusicCommentInfo> {
    return this.musicCommentInfoRepository.findOne({ id: musicId });
  }

  async getMusicComments(musicId: number, index?: number) {
    const musicCommentIndex = isDefined(index) ? 10 : 2;
    index = index ?? 0;
    let limit = musicCommentIndex;
    return this.musicCommentInfoRepository.find({
      where: { musicId: musicId },
      order: { timestamp: 'DESC' },
      skip: index * musicCommentIndex,
      take: limit,
    });
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
  ): Promise<MusicComment> {
    const music = await this.musicRepository.findOneOrFail({
      relations: ['musicComments'],
      where: { id: musicId },
    });
    const musicComment = this.musicCommentRepository.create({
      comment: comment,
      user: user,
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
}

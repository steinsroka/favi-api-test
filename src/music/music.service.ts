import { HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { MusicTagValue, Tag } from '../common/entity/music-tag-value.entity';
import { Message } from '../common/class/message';
import { MusicCommentInfo } from '../common/view/music-comment-info.entity';
import { TagCountDto } from './dto/tag-count.dto';

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
    private readonly musicTagValueRepository: Repository<MusicTagValue>
  ) {}

  getMusic(id: string): Promise<MusicInfo> {
    return this.musicInfoRepository.findOneOrFail({ id: id });
  }

  async isExistMusic(id: string): Promise<boolean> {
    return await this.musicInfoRepository.count({ id: id }) > 0;
  }

  addMusicLike(id: string, user: User) {
    const musicLike = this.musicLikeRepository.create({userId: user.id, musicId: id});
    return this.musicLikeRepository.save(musicLike);
  }

  deleteMusicLike(id: string, user: User) {
    return this.musicLikeRepository.delete({musicId: id, userId: user.id});
  }

  async isExistMusicLike(id: string, user: User) {
    return await this.musicLikeRepository.count({musicId: id, userId: user.id}) > 0;
  }

  async getMusicComment(id: number): Promise<MusicCommentInfo> {
    return this.musicCommentInfoRepository.findOneOrFail({id: id});
  }

  async getMusicComments(musicId: string, index?: number) {
    const musicCommentIndex = isDefined(index) ? 10 : 2;
    index = index ?? 0;
    let limit = musicCommentIndex;
    return this.musicCommentInfoRepository.find({where: {musicId: musicId}, order: {timestamp: 'DESC'}, skip: index * musicCommentIndex, take: limit});
  }

  async isExistMusicComment(id: number) {
    return await this.musicCommentRepository.count({id: id}) > 0;
  }

  async addMusicComment(
    id: string,
    user: User,
    comment: string,
  ): Promise<MusicComment> {
    const music = await this.musicRepository.findOneOrFail({
      relations: ['musicComments'],
      where: { id: id },
    });
    const musicComment = this.musicCommentRepository.create({
      comment: comment,
      user: user,
    });
    music.musicComments.push(musicComment);
    const newMusic = await this.musicRepository.save(music);
    return newMusic.musicComments.pop();
  }

  async deleteMusicComment(id: number, musicId: string): Promise<DeleteResult> {
    return this.musicCommentRepository.delete(id);
  }

  async updateMusicComment(
    id: number,
    newComment: string,
  ): Promise<MusicComment> {
    const musicComment = await this.musicCommentRepository.findOneOrFail({
      where: { id: id },
    });
    musicComment.comment = newComment;
    return this.musicCommentRepository.save(musicComment);
  }

  addMusicCommentLike(id: number, user: User) {
    const musicCommentLike = this.musicCommentLikeRepository.create({musicCommentId: id, userId: user.id});
    return this.musicCommentLikeRepository.save(musicCommentLike);
  }

  deleteMusicCommentLike(id: number, user: User): Promise<DeleteResult> {
    return this.musicCommentLikeRepository.delete({musicCommentId: id, userId: user.id});
  }

  async getMusicTags(id: string): Promise<TagCountDto[]> {
    return (await this.musicTagRepository
      .createQueryBuilder('musicTag')
      .select('value.tag', 'tag')
      .addSelect('value.class', 'class')
      .addSelect('count(value.tag)', 'count')
      .leftJoin('musicTag.musicTagValue', 'value')
      .where('musicId = :id', { id })
      .groupBy('value.tag')
      .orderBy('count', 'DESC')
      .getRawMany());
  }

  async getMusicCommentTags(id: number): Promise<TagCountDto[]> {
    return (await this.musicTagRepository
      .createQueryBuilder('musicTag')
      .select('value.tag', 'tag')
      .addSelect('value.class', 'class')
      .addSelect('count(value.tag)', 'count')
      .leftJoin('musicTag.musicTagValue', 'value')
      .where('musicCommentId = :id', { id })
      .groupBy('value.tag')
      .orderBy('count', 'DESC')
      .getRawMany());
  }

  async addMusicTag(id: string, tag: Tag, user: User, commentId?: number): Promise<InsertResult> {
    const musicTagValue = await this.musicTagValueRepository.findOneOrFail({where: {tag: tag}});
    return this.musicTagRepository.insert({musicId: id, musicCommentId: commentId, userId: user.id, musicTagValueId: musicTagValue.id});
  }
}

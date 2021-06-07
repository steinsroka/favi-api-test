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

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    private readonly musicRepository: Repository<Music>,
    @InjectRepository(MusicInfo)
    private readonly musicInfoRepository: Repository<MusicInfo>,
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
    return this.musicInfoRepository.findOne({ where: { id: id } });
  }

  addMusicLike(id: string, user: User) {
    const musicLike = this.musicLikeRepository.create({userId: user.id, musicId: id});
    return this.musicLikeRepository.insert(musicLike);
  }

  deleteMusicLike(id: string, user: User) {
    return this.musicLikeRepository.delete({musicId: id, userId: user.id});
  }

  async getMusicComments(id: string, index?: number): Promise<MusicComment[]> {
    const musicCommentIndex = isDefined(index) ? 10 : 2;
    index = index ?? 0;
    let limit = musicCommentIndex;
    return this.musicCommentRepository
      .createQueryBuilder('musicComment')
      .leftJoinAndSelect('musicComment.musicTags', 'tags')
      .leftJoinAndSelect('musicComment.user', 'user')
      .where('musicComment.musicId = :id', {id: id})
      .skip(index * musicCommentIndex)
      .take(limit)
      .getMany();
  }

  async addMusicComment(
    id: string,
    user: User,
    comment: string,
  ): Promise<MusicComment> {
    const music = await this.musicRepository.findOne({
      relations: ['musicComments'],
      where: { id: id },
    });
    const musicComment = this.musicCommentRepository.create({
      comment: comment,
      user: user,
    });
    music.musicComments.push(musicComment);
    this.musicRepository.save(music);
    return musicComment;
  }

  async deleteMusicComment(id: number): Promise<Music> {
    const music = await this.musicRepository.findOne({
      relations: ['comments'],
      where: { id: id },
    });
    music.musicComments = music.musicComments.filter((comment) => {
      comment.id !== id;
    });
    return this.musicRepository.save(music);
  }

  async updateMusicComment(
    id: number,
    newComment: string,
  ): Promise<MusicComment> {
    const musicComment = await this.musicCommentRepository.findOne({
      where: { id: id },
    });
    musicComment.comment = newComment;
    return this.musicCommentRepository.save(musicComment);
  }

  addMusicCommentLike(id: number, user: User): Promise<InsertResult> {
    const musicCommentLike = this.musicCommentLikeRepository.create({musicCommentId: id, userId: user.id});
    return this.musicCommentLikeRepository.insert(musicCommentLike);
  }

  deleteMusicCommentLike(id: number, user: User): Promise<DeleteResult> {
    return this.musicCommentLikeRepository.delete({musicCommentId: id, userId: user.id});
  }

  getMusicTag(id: string) {
    return this.musicTagRepository
      .createQueryBuilder('musicTag')
      .select('value.tag')
      .addSelect('value.class')
      .addSelect('count(value.tag)', 'count')
      .leftJoin('musicTag.musicTagValue', 'value')
      .groupBy('value.tag')
      .where('musicId = :musicId', { id })
      .getMany()
  }

  async addMusicTag(id: string, tag: Tag, user: User, commentId?: number): Promise<InsertResult> {
    const musicTagValue = await this.musicTagValueRepository.findOne({where: {tag: tag}});
    return await this.musicTagRepository.insert({musicId: id, musicCommentId: commentId, userId: user.id, musicTagValueId: musicTagValue.id});
  }
}

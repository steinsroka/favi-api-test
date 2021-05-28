import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MusicPartialDto } from './dto/music-partial.dto';
import { Music } from '../common/entity/music.entity';
import { User } from '../common/entity/user.entity';
import { MusicInfo } from '../common/view/music-info.entity';
import { MusicComment } from 'src/common/entity/music-comment.entity';
import { isDefined } from 'class-validator';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    private readonly musicRepository: Repository<Music>,
    @InjectRepository(MusicInfo)
    private readonly musicInfoRepository: Repository<MusicInfo>,
    @InjectRepository(MusicComment)
    private readonly musicCommentRepository: Repository<MusicComment>,
  ) {}

  getMusic(id: string): Promise<MusicInfo> {
    return this.musicInfoRepository.findOne({ where: {id: id} });
  }

  async addMusicLike(id: string, user: User): Promise<Music> {
    const music = await this.musicRepository.findOne({
      relations: ['likedUsers'],
      where: { id: id },
    });
    music.likedUsers.push(user);
    return this.musicRepository.save(music);
  }

  async deleteMusicLike(id: string, user: User): Promise<Music> {
    const music = await this.musicRepository.findOne({
      relations: ['likedUsers'],
      where: { id: id },
    });
    music.likedUsers = music.likedUsers.filter((likedUser) => {
      likedUser.id !== user.id;
    });
    return this.musicRepository.save(music);
  }

  async getMusicComments(id: string, index?: number): Promise<MusicComment[]> {
    const musicCommentIndex = isDefined(index) ? 10 : 2;
    index = index ?? 0;
    let limit = musicCommentIndex;
    return this.musicCommentRepository
      .createQueryBuilder('musicComment')
      .leftJoinAndSelect('musicComment.tags', 'tags')
      .leftJoinAndSelect('musicComment.user', 'user')
      .whereInIds(id)
      .skip(index * musicCommentIndex)
      .take(limit)
      .getMany();
  }

  async addMusicComment(id: string, user: User, comment: string): Promise<Music> {
    const music = await this.musicRepository.findOne({relations: ['comments'], where: {id: id}});
    const musicComment = this.musicCommentRepository.create({comment: comment, user: user});
    music.comments.push(musicComment);
    return this.musicRepository.save(music);
  }

  async deleteMusicComment(id: number): Promise<Music> {
    const music = await this.musicRepository.findOne({relations: ['comments'], where: {id: id}});
    music.comments = music.comments.filter((comment) => {
      comment.id !== id;
    });
    return this.musicRepository.save(music);
  }

  async updateMusicComment(id: number, newComment: string): Promise<MusicComment> {
    const musicComment = await this.musicCommentRepository.findOne({where: {id: id}});
    musicComment.comment = newComment;
    return this.musicCommentRepository.save(musicComment);
  }

  async addMusicCommentLike(id: number, user: User): Promise<MusicComment> {
    const musicComment = await this.musicCommentRepository.findOne({relations: ['likedUsers'], where: {id: id}});
    musicComment.likedUsers.push(user);
    return this.musicCommentRepository.save(musicComment);
  }

  async deleteMusicCommentLike(id: number): Promise<MusicComment> {
    const musicComment = await this.musicCommentRepository.findOne({relations: ['likedUsers'], where: {id: id}});
    musicComment.likedUsers = musicComment.likedUsers.filter((comment) => {
      comment.id !== id
    })
    return this.musicCommentRepository.save(musicComment);
  }

  async getMusicTag(id: string) {
    
  }
}
 
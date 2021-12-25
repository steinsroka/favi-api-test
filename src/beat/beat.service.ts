import {
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, InsertResult, Repository } from 'typeorm';
import { Beat } from '../common/entity/beat.entity';
import { User } from '../common/entity/user.entity';
import { BeatInfo } from '../common/view/beat-info.entity';
import { isDefined } from 'class-validator';
import { BeatLike } from '../common/entity/beat-like.entity';
import { Message } from '../common/class/message';
import { EditBeatDto } from './dto/edit-beat.dto';
import { AddBeatDto } from './dto/add-beat.dto';
import { BeatComment } from '../common/entity/beat-comment.entity';
import { BeatCommentInfo } from '../common/view/beat-comment-info.entity';
import { BeatCommentLike } from '../common/entity/beat-comment-like.entity';
import { BeatTag } from '../common/entity/beat-tag.entity';
import {
  BeatTagValue,
  Tag,
  TagClass,
} from '../common/entity/beat-tag-value.entity';
import { BeatTagInfo } from '../common/view/beat-tag-info.entity';

@Injectable()
export class BeatService {
  constructor(
    @InjectRepository(Beat)
    private readonly beatRepository: Repository<Beat>,
    @InjectRepository(BeatInfo)
    private readonly beatInfoRepository: Repository<BeatInfo>,
    @InjectRepository(BeatLike)
    private readonly beatLikeRepository: Repository<BeatLike>,
    @InjectRepository(BeatCommentInfo)
    private readonly beatCommentInfoRepository: Repository<BeatCommentInfo>,
    @InjectRepository(BeatComment)
    private readonly beatCommentRepository: Repository<BeatComment>,

    @InjectRepository(BeatCommentLike)
    private readonly beatCommentLikeRepository: Repository<BeatCommentLike>,
    @InjectRepository(BeatTag)
    private readonly beatTagRepository: Repository<BeatTag>,
    @InjectRepository(BeatTagValue)
    private readonly beatTagValueRepository: Repository<BeatTagValue>,
    @InjectRepository(BeatTagInfo)
    private readonly beatTagInfoRepository: Repository<BeatTagInfo>,
  ) {}
    async addBeat(user: User, addBeatDto: AddBeatDto){
      const beat = this.beatRepository.create({
        title: addBeatDto.title,
        contents: addBeatDto.contents,
        userId: user.id,
        language: addBeatDto.language,
        bpm: addBeatDto.bpm,
        melodyScale: addBeatDto.melodyScale
      });
      return this.beatRepository.save(beat);
    }
  async getBeat(beatId: number, user?: User): Promise<BeatInfo> {
    const beat = await this.beatInfoRepository.findOneOrFail({ id: beatId });
    // music.tags = await this.getMusicTags(musicId);
    beat.myLike = isDefined(user)
      ? await this.isExistBeatLike(beatId, user)
      : null;
    // music.artists = await this.getMusicArtists(musicId);
    return beat;
  }

  async getBeats(beatIds: number[]): Promise<BeatInfo[]> {
    const beatInfos = await this.beatInfoRepository.find({where: {id: In(beatIds)}, order: {id: 'ASC'}});
    const tags = await this.beatTagInfoRepository.find({where: {beatId: In(beatIds)}, order: {beatId: 'ASC'}});
    // const artists = await this.musicRepository.find({where: {id: In(musicIds)}, relations: ['artists'], order: {id: 'ASC'}});
    let j = 0;
    for(let i = 0; i < beatInfos.length; ++i) {
      // musicInfos[i].artists = artists[i].artists;
      beatInfos[i].tags = [];
      while(1) {
        if(j < tags.length && tags[j].beatId === beatInfos[i].id) {
          beatInfos[i].tags.push(tags[j]);
          ++j;
        }
        else {
          break;
        }
      }
    }
    return beatInfos;
  }

  async editBeat(beatId: number, editBeatDto: EditBeatDto) {
    const beat = await this.beatRepository.findOneOrFail(beatId);
    for (const key of Object.keys(editBeatDto)) {
      beat[key] = editBeatDto[key];
    }
    await this.beatRepository.save(beat);
    return await this.getBeat(beatId);
  }
  // async getMusic2(musicId: number, user?: User): Promise<MusicInfo> {
  //   const music = await this.musicInfoRepository.findOneOrFail({ id: musicId });
  //   music.artists = await this.getMusicArtists(musicId);
  //   return music;
  // }
  async isExistBeat(beatId: number): Promise<boolean> {
    return (await this.beatRepository.count({ id: beatId })) > 0;
  }

  addBeatLike(beatId: number, user: User) {
    const beatLike = this.beatLikeRepository.create({
      userId: user.id,
      beatId: beatId,
    });
    return this.beatLikeRepository.save(beatLike);
  }

  deleteBeatLike(beatId: number, user: User) {
    return this.beatLikeRepository.delete({
      beatId: beatId,
      userId: user.id,
    });
  }

  async isExistBeatLike(beatId: number, user: User): Promise<boolean> {
    return (
      (await this.beatLikeRepository.count({
        beatId: beatId,
        userId: user.id,
      })) > 0
    );
  }

  async isExistBeatCommentLike(
    beatCommentId: number,
    user: User,
  ): Promise<boolean> {
    return (
      (await this.beatCommentLikeRepository.count({
        beatCommentId: beatCommentId,
        userId: user.id,
      })) > 0
    );
  }

  async getBeatComment(
    beatCommentId: number,
    user?: User,
  ): Promise<BeatCommentInfo> {
    const beatComment = await this.beatCommentInfoRepository.findOne({
      id: beatCommentId,
    });
    // beatComment.tags = await this.getMusicCommentTags(musicComment.id);
    beatComment.myLike = isDefined(user)
      ? await this.isExistBeatCommentLike(beatComment.id, user)
      : null;
    if (isDefined(beatComment.parentId)) {
      beatComment.parent = await this.getBeatComment(
        beatComment.parentId,
        user,
      );
    }
    return beatComment;
  }

  async getBeatComments(beatId: number, index?: number, user?: User) {
    const beatCommentIndex = isDefined(index) ? 10 : 2;
    index = index ?? 0;
    let limit = beatCommentIndex;
    const beatComments = await this.beatCommentInfoRepository.find({
      where: { beatId: beatId },
      order: { timestamp: 'DESC' },
      skip: index * beatCommentIndex,
      take: limit,
    });
    for (let i = 0; i < beatComments.length; ++i) {
      // beatComments[i].tags = await this.getBeatCommentTags(
      //   beatComments[i].id,
      // );
      beatComments[i].myLike = isDefined(user)
        ? await this.isExistBeatCommentLike(beatComments[i].id, user)
        : null;
    }
    return beatComments;
  }

  async isExistBeatComment(beatCommentId: number) {
    return (
      (await this.beatCommentRepository.count({ id: beatCommentId })) > 0
    );
  }


  async addBeatComment(
    beatId: number,
    user: User,
    comment: string,
    parent: number,
  ): Promise<BeatComment> {
    const beat = await this.beatRepository.findOneOrFail({
      relations: ['beatComments'],
      where: { id: beatId },
    });
    let parentBeatComment = null;
    if (isDefined(parent)) {
      parentBeatComment = await this.getBeatComment(parent);
    }
    const beatComment = this.beatCommentRepository.create({
      comment: comment,
      user: user,
      parent: parentBeatComment,
    });
    beat.beatComments.push(beatComment);
    const newBeat = await this.beatRepository.save(beat);
    return newBeat.beatComments.pop();
  }

  async deleteBeatComment(beatCommentId: number): Promise<DeleteResult> {
    return this.beatCommentRepository.delete(beatCommentId);
  }

  async updateBeatComment(
    beatCommentId: number,
    newComment: string,
  ): Promise<BeatComment> {
    const beatComment = await this.beatCommentRepository.findOneOrFail({
      where: { id: beatCommentId },
    });
    beatComment.comment = newComment;
    return this.beatCommentRepository.save(beatComment);
  }




  addBeatCommentLike(beatCommentId: number, user: User) {
    const beatCommentLike = this.beatCommentLikeRepository.create({
      beatCommentId: beatCommentId,
      userId: user.id,
    });
    return this.beatCommentLikeRepository.save(beatCommentLike);
  }

  deleteBeatCommentLike(
    beatCommentId: number,
    user: User,
  ): Promise<DeleteResult> {
    return this.beatCommentLikeRepository.delete({
      beatCommentId: beatCommentId,
      userId: user.id,
    });
  }

  async getBeatTags(
    beatId: number,
    tagClass?: TagClass,
  ): Promise<BeatTagInfo[]> {
    return await this.beatTagInfoRepository.find({ beatId: beatId });
  }

  async addBeatTag(
    beatId: number,
    tag: Tag,
    user: User,
  ): Promise<InsertResult> {
    const beatTagValue = await this.beatTagValueRepository.findOneOrFail({
      where: { name: tag },
    });
    return this.beatTagRepository.insert({
      beatId: beatId,
      userId: user.id,
      beatTagValueId: beatTagValue.id,
    });
  }



}

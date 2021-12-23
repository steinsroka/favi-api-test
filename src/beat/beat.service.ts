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
// import { BeatComment } from '../common/entity/beat-comment.entity';
// import { BeatCommentInfo } from '../common/view/beat-comment-info.entity';

@Injectable()
export class BeatService {
  constructor(
    @InjectRepository(Beat)
    private readonly beatRepository: Repository<Beat>,
    @InjectRepository(BeatInfo)
    private readonly beatInfoRepository: Repository<BeatInfo>,
    @InjectRepository(BeatLike)
    private readonly beatLikeRepository: Repository<BeatLike>,
    // @InjectRepository(BeatCommentInfo)
    // private readonly beatCommentInfoRepository: Repository<BeatCommentInfo>,
    // @InjectRepository(BeatComment)
    // private readonly beatCommentRepository: Repository<BeatComment>,
  ) {}
    async addBeat(user: User, beatTitle: string, beatContents: string, beatLanguage: string, beatBpm: number, beatMelodyScale: string){
      const beat = this.beatRepository.create({
        title: beatTitle,
        contents: beatContents,
        userId: user.id,
        language: beatLanguage,
        bpm: beatBpm,
        melodyScale: beatMelodyScale
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

  // async getBeatComment(
  //   beatCommentId: number,
  //   user?: User,
  // ): Promise<BeatCommentInfo> {
  //   // const musicComment = await this.musicCommentInfoRepository.findOne({
  //   //   id: musicCommentId,
  //   // });
  //   // musicComment.tags = await this.getMusicCommentTags(musicComment.id);
  //   // musicComment.myLike = isDefined(user)
  //   //   ? await this.isExistMusicCommentLike(musicComment.id, user)
  //   //   : null;
  //   // if (isDefined(musicComment.parentId)) {
  //   //   musicComment.parent = await this.getMusicComment(
  //   //     musicComment.parentId,
  //   //     user,
  //   //   );
  //   // }
  //   // return musicComment;
  // }

  // async getBeatComments(beatId: number, index?: number, user?: User) {
  //   // const musicCommentIndex = isDefined(index) ? 10 : 2;
  //   // index = index ?? 0;
  //   // let limit = musicCommentIndex;
  //   // const musicComments = await this.musicCommentInfoRepository.find({
  //   //   where: { musicId: musicId },
  //   //   order: { timestamp: 'DESC' },
  //   //   skip: index * musicCommentIndex,
  //   //   take: limit,
  //   // });
  //   // for (let i = 0; i < musicComments.length; ++i) {
  //   //   musicComments[i].tags = await this.getMusicCommentTags(
  //   //     musicComments[i].id,
  //   //   );
  //   //   musicComments[i].myLike = isDefined(user)
  //   //     ? await this.isExistMusicCommentLike(musicComments[i].id, user)
  //   //     : null;
  //   // }
  //   // return musicComments;
  // }
  //
  // async isExistBeatComment(beatCommentId: number) {
  //   // return (
  //   //   (await this.musicCommentRepository.count({ id: musicCommentId })) > 0
  //   // );
  // }


}

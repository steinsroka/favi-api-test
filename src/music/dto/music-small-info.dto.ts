import { IsNumber, IsString } from 'class-validator';
import {
  OneToMany,
} from 'typeorm';
import { MusicTag } from './music-tag.entity';

export class MusicSmallInfoDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  composer: string;

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music, { cascade: true })
  musicTags: MusicTag[];
}

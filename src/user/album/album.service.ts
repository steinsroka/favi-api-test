import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Music } from 'src/music/music.entity';
import { Repository } from 'typeorm';
import { Album } from './album.entity';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {}

  getAlbumsFromUserId(userId: number): Promise<Album[]> {
    return this.albumRepository
      .createQueryBuilder('album')
      .innerJoinAndSelect('album.user', 'user')
      .select(['album.id', 'album.name', 'album.public', 'album.timestamp'])
      .where('user.id = :id', { id: userId })
      .getMany();
  }

  //need test
  changeAlbumName(userId: number, oldName: string, newName: string) {
    return this.albumRepository
      .createQueryBuilder('album')
      .update()
      .set({ name: newName })
      .where('name = :name and userId = :userId', {
        name: oldName,
        userId: userId,
      })
      .execute();
  }

  //need test
  deleteAlbum(userId: number, name: string): void {
    console.log(
      this.albumRepository
        .createQueryBuilder('album')
        .delete()
        .where('name = :name and userId = :userId', {
          name: name,
          userId: userId,
        })
        .getQuery(),
    );
  }

  async getAlbumContentFromName(name: string): Promise<Music[]> {
    return (
      await this.albumRepository.findOne({
        relations: ['musics'],
        where: { name: name },
      })
    ).musics;
  }

  insertAlbum(name: string) {
    return this.albumRepository.insert({ name: name });
  }
}

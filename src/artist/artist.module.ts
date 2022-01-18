import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistLike } from '../common/entity/artist-like.entity';
import { Artist } from '../common/entity/artist.entity';
import { UserModule } from '../user/user.module';
import { ArtistController } from './artist.controller';
import { ArtistService } from './artist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artist, ArtistLike]),
    forwardRef(() => UserModule),
  ],
  exports: [TypeOrmModule, ArtistService],
  controllers: [ArtistController],
  providers: [ArtistService],
})
export class ArtistModule {}

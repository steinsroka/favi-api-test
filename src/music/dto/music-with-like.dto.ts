import { IntersectionType } from "@nestjs/swagger";
import { Music } from "src/common/entity/music.entity";

export class MusicWithLikeDto extends IntersectionType(
    Music,
    class like{
        myLike : any;
    },
  ) {}

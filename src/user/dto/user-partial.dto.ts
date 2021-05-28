import { PartialType } from '@nestjs/mapped-types';
import { User } from '../../common/entity/user.entity';

export class UserPartialDto extends PartialType(User) {}

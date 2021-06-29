import { PartialType, PickType } from '@nestjs/mapped-types';
import { User } from '../../common/entity/user.entity';

export class UpdateUserDto extends PartialType(
  PickType(User, ['age', 'gender', 'name']),
) {}

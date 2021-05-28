import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { keys } from 'ts-transformer-keys';
import { Repository, DeleteResult } from 'typeorm';
import { UserPartialDto } from './dto/user-partial.dto';
import { User, UserExceptRelations } from '../common/entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  getUser(userPartial: UserPartialDto): Promise<UserPartialDto> {
    return this.userRepository.findOne({ where: userPartial });
  }
  deleteUser(userPartial: UserPartialDto): Promise<DeleteResult> {
    return this.userRepository.delete(userPartial);
  }
  getUserAllInfo(userPartial: UserPartialDto): Promise<User> {
    return this.userRepository.findOne({
      where: userPartial,
      select: keys<UserExceptRelations>(),
    });
  }
  saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
  async isExistUser(userPartial: UserPartialDto): Promise<boolean> {
    return (await this.userRepository.count({ where: userPartial })) > 0;
  }
}

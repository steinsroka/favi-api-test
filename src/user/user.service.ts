import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  getUserFromId(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: id } });
  }
  getUserFromEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email: email } });
  }
  deleteUserFromId(id: number): Promise<DeleteResult> {
    return this.userRepository.delete({ id: id });
  }
}

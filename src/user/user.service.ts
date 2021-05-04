import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
  saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
  async isExistUserFromId(id: number): Promise<boolean> {
    return (await this.userRepository.count({ where: { id: id } })) > 0;
  }
  async isExistUserFromEmail(email: string): Promise<boolean> {
    return (await this.userRepository.count({ where: { email: email } })) > 0;
  }
}

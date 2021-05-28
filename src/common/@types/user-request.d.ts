import { Request } from 'express';
import { User } from '../entity/user.entity';

export type UserRequest = Request & { user: User };

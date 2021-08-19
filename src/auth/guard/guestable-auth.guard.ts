import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GuestableAuthGuard extends AuthGuard(['jwt', 'guest']) {}

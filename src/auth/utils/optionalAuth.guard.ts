import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {UnauthorizedException} from '@nestjs/common/exceptions'

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
//   if (err || !user) {
//     // Authentication failed
//     throw err || new UnauthorizedException();
//   }
  // Authentication succeeded
  return user;
  }
}

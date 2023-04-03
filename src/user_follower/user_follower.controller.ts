import {
  Controller,
  Param,
  UseGuards,
  Post,
  Get,
  Body,
  Req,
  Delete
} from '@nestjs/common';

import { UserFollowerService } from './user_follower.service';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';

@Controller('api/profiles')
export class UserFollowerController {
  constructor(private readonly userFollowerService: UserFollowerService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':username/follow')
  async followUser(@Param('username') username: string, @Req() req) {
    return this.userFollowerService.followUser(username, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username/follow')
  async unFollowUser(@Param('username') username: string, @Req() req) {
    return this.userFollowerService.unFollowUser(username, req.user);
  }
}

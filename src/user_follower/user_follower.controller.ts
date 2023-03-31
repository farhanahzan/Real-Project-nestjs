import {
  Controller,
  Param,
  UseGuards,
  Post,
  Get,
  Body,
  Req,
} from '@nestjs/common';

import { UserFollowerService } from './user_follower.service';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';

@Controller('api/profiles')
export class UserFollowerController {
    constructor(private readonly userFollowerService:UserFollowerService){}

    @UseGuards(JwtAuthGuard)
    @Post(':username/follow')
    async followUser(@Param('username') username:string, @Req() req){
        return this.userFollowerService.followUser(username, req.user)
    }
}

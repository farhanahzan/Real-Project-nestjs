import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';
import { UsersService } from 'src/users/users.service';
import { CreateUserParams } from 'src/users/utils/types';
import { Repository } from 'typeorm';
import _, { isObject } from 'lodash';

@Injectable()
export class UserFollowerService {
  constructor(
    
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
    @InjectRepository(UserFollow)
    private userFollowRepo: Repository<UserFollow>,
  ) {}

  // async returnProfile(username:string, userDetail:CreateUserParams){
  //    const userProfileInfo = await this.userProfileRepo.findOne({
  //      select: {
  //        username: true,
  //        bio: true,
  //        image: true,
  //      },
  //      where: { username: username },
  //    });
  //    const following = checkFollowingExits()

  // }

  async checkFollowingExits(targetId:string, userId:string){
    const checkFollowing = await this.userFollowRepo.find({
      where: {
        followerId: targetId,
        userId: userId,
      },
    });
    if(checkFollowing === null){
      return false
    }else{
      return true
    }
  }


  async followUser(username: string, userDetail: CreateUserParams) {
    const userInfo = await this.userProfileRepo.findOneBy({
      username: username,
    });

    if (userInfo === null) {
      throw new NotFoundException('Username Not Found');
    }

    const targetId = userInfo.userId;
   const checkFollow= await this.checkFollowingExits(targetId, userDetail.id);

    
    if (!checkFollow) {
      const addFollower = this.userFollowRepo.create({
        followerId: targetId,
        userId: userDetail.id,
      });
      await this.userFollowRepo.save(addFollower);
    }
   

    // return checkFollowingExists ===null;
    return checkFollow;
  }
}

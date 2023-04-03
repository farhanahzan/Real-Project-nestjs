import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { NotFoundException, ConflictException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';
import { UsersService } from 'src/users/users.service';
import { CreateUserParams } from 'src/users/utils/types';
import { ObjectID, Repository } from 'typeorm';

@Injectable()
export class UserFollowerService {
  constructor(
    @Inject(forwardRef(()=> UsersService))
    private  usersService:UsersService,
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
    
    if(checkFollowing === null || checkFollowing.length === 0){
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
   

    
    return this.usersService.findUserProfileByUsernameWithLogin(username, userDetail.id);
  }

   async unFollowUser(username: string, userDetail: CreateUserParams){
     const userInfo = await this.userProfileRepo.findOneBy({
       username: username,
     });

     if (userInfo === null) {
       throw new NotFoundException('Username Not Found');
     }

     const targetId = userInfo.userId;
     const checkFollow = await this.checkFollowingExits(
       targetId,
       userDetail.id,
     );

     if (checkFollow) {
      const findId = await this.userFollowRepo.findOne({
        where: {
          followerId: targetId,
          userId: userDetail.id,
        },
      });
       const addFollower = await this.userFollowRepo.delete(findId.id)
     }

     return await this.usersService.findUserProfileByUsernameWithLogin(
       username,
       userDetail.id,
     );
   }

}

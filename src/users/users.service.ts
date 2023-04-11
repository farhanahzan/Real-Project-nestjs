import { Injectable} from '@nestjs/common';
import { User as UserEntity } from '../typeorm/entities/user.entity';


import { CreateUserParams, UpdateUserParams, UserParams } from './utils/types';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';

import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UsersRepository,
  ) {}


  async signUp(userDetails: CreateUserParams) {
    const user = userDetails.user;
    const { email, username } = user;
    

    const checkEmail = await this.findByEmail(email);
    const checkUsername = await this.findByUsername(username);

    if (checkEmail !== null) {
      throw new ForbiddenException('Email Already exists');
    }
    if (checkUsername !== null) {
      throw new ForbiddenException('Username Already exists');
    }

    const newUser = await this.userRepository.createUser(user);
    const payload = {
      userId: newUser.id,
    };

    return await this.buildResponseUser(payload.userId);
  }

  async showById(id: string): Promise<UserEntity> {
    const user = await this.findById(id);

    delete user.password;
    return user;
  }

  async findById(id: string) {
    const user= await this.userRepository.findById(id)
     if (user === null) {
       throw new NotFoundException('User Not Found');
     }
     return user
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }
  async findByUsername(username: string) {
    return await this.userRepository.findByUsername(username);
  }

  async showCurrentUser(userDetails: UserParams) {
    return await this.buildResponseUser(userDetails.id);
  }

  async countEmail(email: string) {
    return await this.userRepository.countEmail(email);
  }

  async countUsername(username: string) {
    return await this.userRepository.countUsername(username);
  }

  async updateUser(updateUserParms: UpdateUserParams, currUser: UserParams) {
    const id = currUser.id;
    // console.log(currUser)
    const { email, username } = updateUserParms.user;

    const checkEmail = await this.countEmail(email);

    const checkUsername = await this.countUsername(username);

    if (checkEmail > 1) {
      throw new ForbiddenException('Email Already exists');
    }
    if (checkUsername > 1) {
      throw new ForbiddenException('Username Already exists');
    }
    await this.userRepository.updateUser(updateUserParms, currUser);

    return this.buildResponseUser(id);
  }

  //Profile

  //with login
  async buildResponseProfile(username: string, userDetail: any | UserParams) {
    const userProfileInfo = await this.findByUsername(username);

    const { bio, image } = userProfileInfo;

    let following = false;
    if (Object.keys(userDetail).length > 0) {
      following = await this.checkFollowingExits(
        userProfileInfo.id,
        userDetail.id,
      );
    }

    return {
      profile: {
        username: username,
        bio: bio,
        image: image,
        following: following,
      },
    };
  }

  async buildResponseUser(id: string) {
    const userInfo = await this.userRepository.buildResponseUser(id);
    const accessToken = this.jwtService.sign(id);
    return { user: { ...userInfo, accessToken: accessToken } };
  }

  async getAllTags() {
    const findTags = await this.userRepository.getAllTags()
    const tags = findTags.map((tag) => tag.tag);
    return { tags };
  }

  //user_follower



  async checkFollowingExits(targetId: string, userId: string) {
    const checkFollowing = await this.userRepository.checkFollwing(targetId, userId)

    if (checkFollowing === null || checkFollowing.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  async followUser(username: string, userDetail: UserParams) {
    const userInfo = await this.findByUsername(username)

    if (userInfo === null) {
      throw new NotFoundException('Username Not Found');
    }

    const targetId = userInfo.id;
    const checkFollow = await this.checkFollowingExits(targetId, userDetail.id);

    if (!checkFollow) {
     await this.userRepository.addFollower(targetId, userDetail.id)
    }

    return this.buildResponseProfile(username, userDetail);
  }

  async unFollowUser(username: string, userDetail: UserParams) {
    const userInfo = await this.findByUsername(username);

    if (userInfo === null) {
      throw new NotFoundException('Username Not Found');
    }

    const targetId = userInfo.id;
    const checkFollow = await this.checkFollowingExits(targetId, userDetail.id);

    if (checkFollow) {
      await this.userRepository.deleteFollower(targetId, userDetail.id)
    }

    return await this.buildResponseProfile(username, userDetail);
  }
}

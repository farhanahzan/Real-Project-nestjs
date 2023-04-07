import { Injectable} from '@nestjs/common';
import { User as UserEntity } from '../typeorm/entities/user.entity';


import { CreateUserParams, UserParams } from './utils/types';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/UpdataUser.dto';

import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UsersRepository,
  ) {}

  async signUp(userDetails: CreateUserParams) {
    const user = userDetails.user;
    const { email, username, ...rest } = user;

    const checkEmail = await this.findByEmail(email);
    const checkUsername = await this.findByUsername(username);

    if (checkEmail) {
      throw new ForbiddenException('Email Already exists');
    }
    if (checkUsername) {
      throw new ForbiddenException('Username Already exists');
    }

    const newUser = await this.userRepository.signUp(user);
    const payload = {
      userId: newUser.id,
    };

    return await this.returnUser(payload.userId);
  }

  async showById(id: string): Promise<UserEntity> {
    const user = await this.findById(id);

    delete user.password;
    return user;
  }

  async findById(id: string) {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }
  async findByUsername(username: string) {
    return await this.userRepository.findByUsername(username);
  }

  async showCurrentUser(userDetails: UserParams) {
    return await this.returnUser(userDetails.id);
  }

  async countEmail(email: string) {
    return await this.userRepository.countEmail(email);
  }

  async countUsername(username: string) {
    return await this.userRepository.countUsername(username);
  }

  async updateUser(newUpdate: UpdateUserDto, currUser: UserParams) {
    const id = currUser.id;
    // console.log(currUser)
    const { email, username, password, bio, image } = newUpdate.user;

    const checkEmail = await this.countEmail(email);

    const checkUsername = await this.countUsername(username);

    if (checkEmail > 1) {
      throw new ForbiddenException('Email Already exists');
    }
    if (checkUsername > 1) {
      throw new ForbiddenException('Username Already exists');
    }
    await this.userRepository.updateUser(newUpdate, currUser);

    return this.returnUser(id);
  }

  //Profile

  //with login
  async returnProfile(username: string, userDetail: any | UserParams) {
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

  async returnUser(id: string) {
    const userInfo = await this.userRepository.returnUser(id);
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

    return this.returnProfile(username, userDetail);
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

    return await this.returnProfile(username, userDetail);
  }
}

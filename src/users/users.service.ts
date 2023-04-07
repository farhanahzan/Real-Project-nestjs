import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { User as UserEntity } from '../typeorm/entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Equal, IsNull, Repository } from 'typeorm';
import { CreateUserParams, UserParams } from './utils/types';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/UpdataUser.dto';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { UserFollowerService } from '../user_follower/user_follower.service';
import { Tag } from 'src/typeorm/entities/tag.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
    @InjectRepository(UserFollow)
    private userFollowRepo: Repository<UserFollow>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    private userRepository: UsersRepository,
  ) {}

  async signUp(userDetails: CreateUserParams) {
    const user = userDetails.user;

    return await this.userRepository.signUp(user);
  }

  async showById(id: string): Promise<UserEntity> {
    const user = await this.findById(id);

    delete user.password;
    return user;
  }

  async findById(id: string) {
    return await this.userRepository.findById(id)
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email)
  }
  async findByUsername(username: string) {
   return await this.userRepository.findByUsername(username)
  }

  async showCurrentUser(userDetails: UserParams) {
    return await this.returnUser(userDetails.id);
  }
  async updateUser(newUpdate: UpdateUserDto, currUser: UserParams) {
    const id = currUser.id;
    // console.log(currUser)
    const { email, username, password, bio, image } = newUpdate.user;

    const checkEmail = await this.userRepo.count({
      where: { email: Equal(email) },
    });

    const checkUsername = await this.userRepo.count({
      where: { username: Equal(username) },
    });

    if (checkEmail > 1) {
      throw new ForbiddenException('Email Already exists');
    }
    if (checkUsername > 1) {
      throw new ForbiddenException('Username Already exists');
    }

    if (password) {
      const hashPassword = await bcrypt.hash(password, 10);
      await this.userRepo.update({ id: id }, { password: hashPassword });
    }
    if (email || username) {
      await this.userRepo.update({ id: id }, { email, username });
    }
    if (bio || image) {
      await this.userProfileRepo.update({ userId: id }, { bio, image });
    }

    return this.returnUser(id);
  }

  //Profile

  //with login
  async returnProfile(username: string, userDetail: any | UserParams) {
    const userProfileInfo = await this.userProfileRepo.findOne({
      where: { username: username },
    });

    const { bio, image } = userProfileInfo;

    let following = false;
    if (Object.keys(userDetail).length > 0) {
      following = await this.checkFollowingExits(
        userProfileInfo.userId,
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
   await this.userRepository.returnUser(id)
  }

  async getAllTags() {
    const findTags = await this.tagRepo.find();
    const tags = findTags.map((tag) => tag.tag);
    return { tags };
  }

  //user_follower

  async checkFollowingExits(targetId: string, userId: string) {
    const checkFollowing = await this.userFollowRepo.find({
      where: {
        followerId: targetId,
        userId: userId,
      },
    });

    if (checkFollowing === null || checkFollowing.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  async followUser(username: string, userDetail: UserParams) {
    const userInfo = await this.userProfileRepo.findOneBy({
      username: username,
    });

    if (userInfo === null) {
      throw new NotFoundException('Username Not Found');
    }

    const targetId = userInfo.userId;
    const checkFollow = await this.checkFollowingExits(targetId, userDetail.id);

    if (!checkFollow) {
      const addFollower = this.userFollowRepo.create({
        followerId: targetId,
        userId: userDetail.id,
      });
      await this.userFollowRepo.save(addFollower);
    }

    return this.returnProfile(username, userDetail);
  }

  async unFollowUser(username: string, userDetail: UserParams) {
    const userInfo = await this.userProfileRepo.findOneBy({
      username: username,
    });

    if (userInfo === null) {
      throw new NotFoundException('Username Not Found');
    }

    const targetId = userInfo.userId;
    const checkFollow = await this.checkFollowingExits(targetId, userDetail.id);

    if (checkFollow) {
      const findId = await this.userFollowRepo.findOne({
        where: {
          followerId: targetId,
          userId: userDetail.id,
        },
      });
      const addFollower = await this.userFollowRepo.delete(findId.id);
    }

    return await this.returnProfile(username, userDetail);
  }
}

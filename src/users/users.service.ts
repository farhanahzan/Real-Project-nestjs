import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { User as UserEntity } from '../typeorm/entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Equal, IsNull, Repository } from 'typeorm';
import { CreateUserParams, UserParams } from './utils/types';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/UpdataUser.dto';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { UserFollowerService } from '../user_follower/user_follower.service';
import { Tag } from 'src/typeorm/entities/tag.entity';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserFollowerService))
    private userFollowService: UserFollowerService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
    @InjectRepository(UserFollow)
    private userFollowRepo: Repository<UserFollow>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
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

    const newUser = this.userRepo.create({ ...user });
    await this.userRepo.save(newUser);
    const payload = {
      userId: newUser.id,
    };

    const newProfile = this.userProfileRepo.create({
      username: username,
      user: newUser,
    });
    await this.userProfileRepo.save(newProfile);

    await this.userRepo.update(
      { id: payload.userId },
      { accessToken: this.jwtService.sign(payload) },
    );

    return await this.returnUser(payload.userId);
    // return this.userRepo.find()
  }

  async showById(id: string): Promise<UserEntity> {
    const user = await this.findById(id);

    delete user.password;
    return user;
  }

  async findById(id: string) {
    return await this.userRepo.findOne({ where: { id: id } });
  }

  async findByEmail(email: string) {
    return await this.userRepo.findOne({
      where: {
        email: email,
      },
    });
  }
  async findByUsername(username: string) {
    return await this.userRepo.findOne({
      where: {
        username: username,
      },
    });
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
      following = await this.userFollowService.checkFollowingExits(
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
    const userInfo = await this.userRepo.findOne({
      select: {
        email: true,
        username: true,
        accessToken: true,
      },

      where: { id: id },
    });
    const userProfileInfo = await this.userProfileRepo.findOne({
      select: {
        bio: true,
        image: true,
      },
      where: { userId: id },
    });

    return { user: { ...userInfo, ...userProfileInfo } };
  }

  async getAllTags() {
    const findTags = await this.tagRepo.find();
    const tags = findTags.map((tag) => tag.tag);
    return { tags };
  }
}



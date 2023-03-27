import { Injectable } from '@nestjs/common';
import { User as UserEntity } from '../typeorm/entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Equal, IsNull, Repository } from 'typeorm';
import { CreateUserParams, UpdateUserParams } from './utils/types';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/UpdataUser.dto';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
  ) {}

  async signUp(userDetails: CreateUserParams) {
    const { email, username, ...rest } = userDetails;
    const checkEmail = await this.findByEmail(email);
    const checkUsername = await this.findByUsername(username);

    if (checkEmail) {
      throw new ForbiddenException('Email Already exists');
    }
    if (checkUsername) {
      throw new ForbiddenException('Username Already exists');
    }

    const newUser = this.userRepo.create({ ...userDetails });
    await this.userRepo.save(newUser);
    const payload = {
      userId: newUser.id,
    };

    const newProfile = this.userProfileRepo.create({
      username: username,
      user: newUser,
    });
    await this.userProfileRepo.save(newProfile);

    const access_token = this.jwtService.sign(payload);

    await this.userRepo.update(
      { id: payload.userId },
      { accessToken: access_token },
    );

    return await this.reDesignReturn(payload.userId);
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

  async showCurrentUser(user: CreateUserParams) {
    return user;
  }
  async updateUser(newUpdate: UpdateUserDto, currUser: CreateUserParams) {
    const id = currUser.id;
    // console.log(currUser)
    const { email, username, password, bio, image } = newUpdate;

    const checkEmail = await this.userRepo.count({ where: { email: Equal(email) } });

    const checkUsername = await this.userRepo.count({
      where: { username: Equal(username) },
    });

    console.log(checkUsername);

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

    await this.userRepo.update({ id: id }, { email, username });

    await this.userProfileRepo.update({ userId: id }, { bio, image });

    return this.reDesignReturn(id);
  }

  async reDesignReturn(id: string) {
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

    
    return { ...userInfo, ...userProfileInfo };
  }
}

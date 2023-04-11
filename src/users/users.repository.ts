import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/typeorm/entities/tag.entity';
import { User } from 'src/typeorm/entities/user.entity';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { Equal, Repository } from 'typeorm';
import { UpdateUserParams, UserParams } from './utils/types';
import * as bcrypt from 'bcryptjs';

import { UpdateUserDto } from './dto/UpdataUser.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(UserFollow)
    private userFollowRepo: Repository<UserFollow>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
  ) {}

  async createUser(user: UserParams) {
    try {
      const newUser = this.userRepo.create({ ...user });
      await this.userRepo.save(newUser);

      return newUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.userRepo.findOne({
        where: {
          email: email,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async findByUsername(username: string) {
    try {
      return await this.userRepo.findOne({
        where: {
          username: username,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findById(id: string) {
    try {
      return await this.userRepo.findOne({ where: { id: id } });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async countEmail(email: string) {
    return await this.userRepo.count({
      where: { email: Equal(email) },
    });
  }

  async countUsername(username: string) {
    return await this.userRepo.count({
      where: { username: Equal(username) },
    });
  }

  async updateUser(updateUserParms: UpdateUserParams, currUser: UserParams) {
    const id = currUser.id;
    const { email, username, password, bio, image } = updateUserParms.user;
    if (password) {
      const hashPassword = await bcrypt.hash(password, 10);
      await this.userRepo.update({ id: id }, { password: hashPassword });
    }
    if (email || username) {
      await this.userRepo.update({ id: id }, { email, username });
    }
    if (bio || image) {
      await this.userRepo.update({ id: id }, { bio, image });
    }
  }
  async buildResponseUser(id: string) {
    return await this.userRepo.findOne({
      select: {
        email: true,
        username: true,
        bio: true,
        image: true,
      },

      where: { id: id },
    });
  }

  async checkFollwing(targetId: string, userId: string) {
    return await this.userFollowRepo.find({
      where: {
        followerId: targetId,
        userId: userId,
      },
    });
  }

  async getAllTags() {
    return await this.tagRepo.find();
  }

  async addFollower(targetId: string, userId: string) {
    const addFollower = this.userFollowRepo.create({
      followerId: targetId,
      userId: userId,
    });
    await this.userFollowRepo.save(addFollower);

    return addFollower;
  }

  async deleteFollower(targetId: string, userId: string) {
    try {
      const findId = await this.userFollowRepo.findOne({
        where: {
          followerId: targetId,
          userId: userId,
        },
      });

      await this.userFollowRepo.delete(findId.id);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}

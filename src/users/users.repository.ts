import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tag } from "src/typeorm/entities/tag.entity";
import { User } from "src/typeorm/entities/user.entity";
import { UserFollow } from "src/typeorm/entities/userFollow.entity";
import { Equal, Repository } from "typeorm";
import { UserParams } from "./utils/types";
import * as bcrypt from 'bcryptjs';


import { UpdateUserDto } from "./dto/UpdataUser.dto";

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

  async signUp(user: UserParams) {
    const newUser = this.userRepo.create({ ...user });
    await this.userRepo.save(newUser);

    return newUser;
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

  async findById(id: string) {
    return await this.userRepo.findOne({ where: { id: id } });
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

  async updateUser(newUpdate: UpdateUserDto, currUser: UserParams) {
    const id = currUser.id;
    const { email, username, password, bio, image } = newUpdate.user;
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
  async returnUser(id: string) {
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
    await this.userFollowRepo.save(addFollower)

    return addFollower
  }

  async deleteFollower(targetId: string, userId: string) {
      const findId = await this.userFollowRepo.findOne({
        where: {
          followerId: targetId,
          userId: userId,
        },
      });
      const addFollower = await this.userFollowRepo.delete(findId.id);
  }
  
}
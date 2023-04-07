import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tag } from "src/typeorm/entities/tag.entity";
import { User } from "src/typeorm/entities/user.entity";
import { UserFollow } from "src/typeorm/entities/userFollow.entity";
import { UserProfile } from "src/typeorm/entities/userProfile.entity";
import { Repository } from "typeorm";
import { UserParams } from "./utils/types";
import { JwtService } from "@nestjs/jwt";
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';

@Injectable()
export class UsersRepository {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
    @InjectRepository(UserFollow)
    private userFollowRepo: Repository<UserFollow>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
  ) {}

  async signUp(user: UserParams) {
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

  async returnUser(id:string){
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
}
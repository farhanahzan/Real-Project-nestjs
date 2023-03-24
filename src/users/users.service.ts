import { Injectable } from '@nestjs/common';
import { User as UserEntity } from '../typeorm/entities/user.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserParams } from './utils/types';



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async showById(id: string): Promise<UserEntity> {
    const user = await this.findById(id);

    delete user.password;
    return user;
  }

  async findById(id: string) {
    return await this.userRepository.findOne({ where: { id: id } });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  }
  async findByUsername(username: string) {
    return await this.userRepository.findOne({
      where: {
        username: username,
      },
    });
  }

  async showCurrentUser(user:CreateUserParams){
    return user
  }
}

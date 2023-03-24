import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/authLogin.dto';
import {
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common/exceptions';
import { User as UserEntity } from '../typeorm/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserParams } from 'src/users/utils/types';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

  async signUp(userDetails: CreateUserParams) {
    const { email, username, ...rest } = userDetails;
    const checkEmail = await this.userService.findByEmail(email);
    const checkUsername = await this.userService.findByUsername(username);

    if (checkEmail) {
      throw new ForbiddenException('Email Already exists');
    }
    if (checkUsername) {
      throw new ForbiddenException('Username Already exists');
    }

    const newUser = this.userRepository.create({ ...userDetails });
    const newProfile = this.userProfileRepository.update()
    await this.userRepository.save(newUser);
    const payload = {
      userId: newUser.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto);

    const payload = {
      userId: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(authLoginDto: AuthLoginDto): Promise<UserEntity> {
    const { email, password } = authLoginDto;

    const user = await this.userService.findByEmail(email);
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException('Email or Password is invalid');
    }
    return user;
  }
}

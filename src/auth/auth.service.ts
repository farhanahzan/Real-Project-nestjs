import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/authLogin.dto';
import {
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { User as UserEntity } from '../typeorm/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto);

    const payload = {
      userId: user.id,
    };
    const access_token = this.jwtService.sign(payload);

    await this.userRepo.update(
      { id: payload.userId },
      { accessToken: access_token },
    );
    return this.userService.returnUser(payload.userId)
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

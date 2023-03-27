import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import {PassportStrategy} from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from "../../typeorm/entities/user.entity";
import { UnauthorizedException } from "@nestjs/common/exceptions";
import {Req} from '@nestjs/common'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { userId: string }) {
    const user = await this.userRepository.findOne({
      where: {
        id: payload.userId,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Login in first');
    }

    delete user.password;
   
   
    return user
  }
}
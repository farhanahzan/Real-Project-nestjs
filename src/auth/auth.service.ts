import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/authLogin.dto';
import {
  UnauthorizedException,
} from '@nestjs/common/exceptions';



@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  
  ) {}

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto);

    const payload = {
      userId: user.id,
    };
   
    return this.userService.buildResponseUser(payload.userId)
  }

  async validateUser(authLoginDto: AuthLoginDto) {
    const { email, password } = authLoginDto.user;

    const user = await this.userService.findByEmail(email);
    if (!(await user?.validatePassword(password))) {
      throw new UnauthorizedException('Email or Password is invalid');
    }
    return user;
  }
}

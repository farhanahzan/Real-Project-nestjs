import { Controller, UseGuards, Post, Body, Get, Req } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/CreateUser.dto';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/authLogin.dto';

@Controller('api/users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  async login(@Body() authLoginDto: AuthLoginDto) {
    return this.authService.login(authLoginDto);
  }


}

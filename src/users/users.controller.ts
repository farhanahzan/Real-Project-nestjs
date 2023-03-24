import { Controller, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {Post, Get, Body, Req} from '@nestjs/common'
import { CreateUserDto } from './dto/CreateUser.dto';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';


@Controller('api/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  show(@Param('id') id: string) {
    return this.userService.showById(id);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get()
  async getCurrentUser(@Req() req) {
    return this.userService.showCurrentUser(req.user);
  }
}

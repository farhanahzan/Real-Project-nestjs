import { Controller, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import {Post, Get, Body, Req, Put} from '@nestjs/common'
import { CreateUserDto } from './dto/CreateUser.dto';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from './dto/UpdataUser.dto';



@Controller('api/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  show(@Param('id') id: string) {
    return this.userService.showById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCurrentUser(@Req() req) {
    // console.log(req.get('Authorization').replace('Bearer', '').trim());
    // console.log(req.user)
    return this.userService.showCurrentUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    return this.userService.updateUser(updateUserDto, req.user);
  }
}

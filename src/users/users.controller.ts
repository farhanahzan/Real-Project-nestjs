import {
  Controller,
  Param,
  UseGuards,
  Post,
  Get,
  Body,
  Req,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { JwtAuthGuard } from 'src/auth/utils/jwtAuth.guard';
import { UpdateUserDto } from './dto/UpdataUser.dto';
import { OptionalAuthGuard } from 'src/auth/utils/optionalAuth.guard';




@Controller('api')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('users')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  show(@Param('id') id: string) {
    return this.userService.showById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getCurrentUser(@Req() req) {
  
    return this.userService.showCurrentUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put('users')
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    return this.userService.updateUser(updateUserDto, req.user);
  }

  @Get('tags')
  async getTags(){
    return this.userService.getAllTags()
  }

  //profile
  //be in last position
  @UseGuards(OptionalAuthGuard)
  @Get('profiles/:username')
  async getProfile(
    @Param('username') username: string,
    @Req() req,
  ) {
    return this.userService.returnProfile(
      username,
      req.user,
    );
  }


}

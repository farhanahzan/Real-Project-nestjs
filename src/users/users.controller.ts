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

  //profile
  @UseGuards(JwtAuthGuard)
  @Get('profiles/:username')
  async getProfileByUsernameWithLogin(
    @Param('username') username: string,
    @Req() req,
  ) {
    return this.userService.findUserProfileByUsernameWithLogin(
      username,
      req.user.id,
    );
  }

  // @Get('profiles/:username')
  // async getProfileByUsername(@Param('username') username: string) {
  //   return this.userService.findUserProfileByUsername(username);
  // }
}

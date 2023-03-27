import { Controller,  Post, Body} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/authLogin.dto';

@Controller('api/users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}



  @Post('login')
  async login(@Body() authLoginDto: AuthLoginDto) {
    return this.authService.login(authLoginDto);
  }


}

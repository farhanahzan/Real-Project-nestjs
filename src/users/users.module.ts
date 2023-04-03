import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {TypeOrmModule} from '@nestjs/typeorm'
import { User } from 'src/typeorm/entities/user.entity';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { UserFollowerModule } from 'src/user_follower/user_follower.module';
import { UserFollowerService } from 'src/user_follower/user_follower.service';
@Module({
  imports: [
   
    TypeOrmModule.forFeature([User, UserProfile, UserFollow]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService,UserFollowerService],
  exports: [UsersService],
})
export class UsersModule {}

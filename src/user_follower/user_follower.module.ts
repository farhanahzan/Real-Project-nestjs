import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user.entity';
import { UserFollow } from 'src/typeorm/entities/userFollow.entity';
import { UserProfile } from 'src/typeorm/entities/userProfile.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { UserFollowerController } from './user_follower.controller';
import { UserFollowerService } from './user_follower.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([UserFollow, User, UserProfile]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
  ],
  controllers: [UserFollowerController],
  providers: [UserFollowerService],
  exports: [UserFollowerService],
})
export class UserFollowerModule {}

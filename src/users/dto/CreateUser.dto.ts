import { Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  ValidateNested
} from 'class-validator';

export class UserDto{
    @IsNotEmpty()
    @IsAlphanumeric()
    username:string

    @IsNotEmpty()
    @IsEmail()
    email:string

    @IsNotEmpty()
    @IsString()
    password:string

    @IsOptional()
    @IsUrl()
    image:string

    @IsOptional()
    @IsString()
    bio:string
}

export class CreateUserDto {
  @ValidateNested()
  @Type(() => UserDto)
  @IsNotEmpty()
  user: UserDto;
}

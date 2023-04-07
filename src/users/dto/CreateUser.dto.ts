import {
  IsAlphanumeric,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl
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

export class CreateUserDto{
  user:UserDto
}
import {
  IsAlphanumeric,
  IsEmail,
  IsString,
  IsNotEmpty,
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
}

export class CreateUserDto{
  user:UserDto
}
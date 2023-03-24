import {
  IsAlphanumeric,
  IsEmail,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto{
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
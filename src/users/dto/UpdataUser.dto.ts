import { IsAlphanumeric, IsEmail, IsString, IsOptional, IsUrl} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsAlphanumeric()
  username: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsUrl()
  image: string;

  @IsOptional()
  @IsString()
  bio: string;
}

import { IsAlphanumeric, IsEmail, IsString, IsOptional, IsUrl} from 'class-validator';

export class UpdateDto {
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

export class UpdateUserDto {
  user: UpdateDto;
}
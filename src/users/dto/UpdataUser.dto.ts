import { Type } from 'class-transformer';
import { IsAlphanumeric, IsEmail, IsString, IsOptional, IsUrl, ValidateNested, IsNotEmpty} from 'class-validator';

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
  @ValidateNested()
  @Type(() => UpdateDto)
  @IsNotEmpty()
  user: UpdateDto;
}

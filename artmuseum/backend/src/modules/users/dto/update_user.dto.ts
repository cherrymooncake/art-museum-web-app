import { IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'gender must be male or female' })
  gender?: Gender;
}


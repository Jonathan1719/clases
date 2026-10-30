import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';
import { LoginAuthDto } from './login-auth.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterAuthDto extends LoginAuthDto implements Pick<CreateUserDto, 'name' | 'age'> {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsInt()
  @Min(0)
  @Max(150)
  age!: number;
}
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterAuthDto } from './dto/register-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
private jwtService: JwtService,
@InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async register(userData: RegisterAuthDto) {
const existingUser = await this.userRepository.findOneBy({ email: userData.email });
if (existingUser) {
  throw new ConflictException('Ya existe una cuenta con ese correo.');
}

const user = this.userRepository.create({
  ...userData,
  password: await bcrypt.hash(userData.password, 10),
});
const savedUser = await this.userRepository.save(user);

return this.createAuthResponse(savedUser);
  }

  async login(credentials: LoginAuthDto) {
const user = await this.userRepository
  .createQueryBuilder('user')
  .addSelect('user.password')
  .where('user.email = :email', { email: credentials.email })
  .getOne();

if (!user?.password || !(await bcrypt.compare(credentials.password, user.password))) {
  throw new UnauthorizedException('Correo o contraseña incorrectos.');
}

return this.createAuthResponse(user);
  }

  private createAuthResponse(user: User) {
const token = this.jwtService.sign({ email: user.email, id: user.id });
return {
  token,
  user: { id: user.id, name: user.name, email: user.email, age: user.age },
};
  }
}

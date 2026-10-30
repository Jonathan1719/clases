import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private userRepository:Repository<User>){}
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }
    const user = this.userRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    });
    return this.toPublicUser(await this.userRepository.save(user));
  }

  async findAll() {
    return (await this.userRepository.find()).map((user) => this.toPublicUser(user));
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`No existe el usuario ${id}.`);
    }
    return this.toPublicUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`No existe el usuario ${id}.`);
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOneBy({ email: updateUserDto.email });
      if (existingUser) {
        throw new ConflictException('Ya existe una cuenta con ese correo.');
      }
    }
    const updates = { ...updateUserDto };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    Object.assign(user, updates);
    return this.toPublicUser(await this.userRepository.save(user));
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`No existe el usuario ${id}.`);
    }
    await this.userRepository.remove(user);
    return { id, deleted: true };
  }

  private toPublicUser(user: User) {
    return { id: user.id, name: user.name, email: user.email, age: user.age };
  }
}

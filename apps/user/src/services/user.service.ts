import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { Nullable } from '@app/shared/types/types';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  public async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async saveUser(user: CreateUserDto): Promise<User> {
    return this.userRepository.save(user);
  }

  public async getUserByEmail(email: string): Promise<Nullable<User>> {
    return this.userRepository.findOne({ where: { email } });
  }
}

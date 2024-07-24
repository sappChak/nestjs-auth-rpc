import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nullable } from '@app/shared/types/types';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  public async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async saveUser(user: CreateUserDto): Promise<User> {
    let existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (existingUser) {
      existingUser = this.userRepository.merge(existingUser, user);
    } else {
      existingUser = this.userRepository.create(user);
    }

    return this.userRepository.save(existingUser);
  }

  public async getUserByEmail(email: string): Promise<Nullable<User>> {
    return this.userRepository.findOne({ where: { email } });
  }
}

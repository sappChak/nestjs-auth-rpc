import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Nullable } from '@app/shared/types/types';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) { }

  public async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  public async getUserById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  public async getUserByEmail(email: string): Promise<Nullable<User>> {
    return this.userRepository.findOne({ where: { email } });
  }

  public async mergeOrCreateUser(user: CreateUserDto): Promise<User> {
    let existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    existingUser = existingUser
      ? this.userRepository.merge(existingUser, user)
      : this.userRepository.create(user);

    return this.userRepository.save(existingUser);
  }

  public async deleteUser(id: number): Promise<DeleteResult> {
    return this.userRepository.delete(id);
  }
}

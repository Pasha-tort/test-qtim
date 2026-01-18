import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(userId: string) {
    return this.userRepository.findOneBy({ id: userId });
  }

  async findByLogin(login: string) {
    return this.userRepository.findOneBy({ login });
  }
}

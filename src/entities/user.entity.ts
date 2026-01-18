import { settingsUser } from '@shared/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    length: settingsUser.maxLengthCharsLogin,
    type: 'varchar',
    unique: true,
  })
  login: string;

  @Column({
    length: settingsUser.maxLengthCharsLogin,
    type: 'varchar',
    unique: true,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 1028,
  })
  passwordHash: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}

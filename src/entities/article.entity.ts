import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { settingsArticle } from '@shared/common';
import { UserEntity } from './user.entity';

@Entity('articles')
export class ArticleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: settingsArticle.maxLengthCharsTitle, type: 'varchar' })
  title: string;

  @Column('varchar')
  desc: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  author: UserEntity;

  @Index()
  @Column('varchar')
  authorId: string;
}

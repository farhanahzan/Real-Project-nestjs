import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  image: string;

  @Column({nullable: true , default: 'I work at statefarm' })
  bio: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.userProfile, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}

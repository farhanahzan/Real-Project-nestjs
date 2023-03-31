import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserFollow{
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column()
    userId:string

    @Column()
    followerId:string

    @ManyToOne(()=>User,(user)=>user.userFollow)
    user:User
}
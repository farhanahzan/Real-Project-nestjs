import {Entity, BaseEntity, BeforeInsert, Column, CreateDateColumn, PrimaryGeneratedColumn, OneToOne, JoinColumn, BeforeUpdate} from 'typeorm'
import * as bcrypt from 'bcryptjs'  
import { UserProfile } from './userProfile.entity'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  accessToken: string;

  @OneToOne(() => UserProfile, (userProfile) => userProfile.user)
  userProfile: UserProfile;

  @BeforeInsert()
  @BeforeUpdate()
  async hashedPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
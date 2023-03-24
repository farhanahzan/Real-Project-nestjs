import {Entity, BaseEntity, BeforeInsert, Column, CreateDateColumn, PrimaryGeneratedColumn} from 'typeorm'
import * as bcrypt from 'bcryptjs'  

@Entity()
export class User extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column()
    email:string

    @Column()
    username:string

    @Column()
    password:string

    @CreateDateColumn()
    createdAt:Date

    @BeforeInsert()
    async hashedPassword(){
        this.password = await bcrypt.hash(this.password, 10)
    }

    async validatePassword(password:string):Promise<boolean>{
        return await bcrypt.compare(password, this.password)
    }

    
}
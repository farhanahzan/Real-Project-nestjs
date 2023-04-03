import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany } from 'typeorm';
import { Article } from './article.entity';


@Entity()
export class Tag{
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column()
    tag:string

    @ManyToMany(()=>Article,(article)=>article.tag)
    article:Article[]
}
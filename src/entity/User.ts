import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Relation } from './Relation';
import { Suggestion } from './Suggestion';
import { Userform } from './Userform';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  profileIconURL: string;

  @Column('boolean', { default: false })
  isAdmin: boolean;

  @CreateDateColumn({
    name: "created_at"
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedAt: Date;
  
  @OneToMany(type => Relation, relation => relation.user)
  relations: Relation[];

  @OneToMany(type => Suggestion, suggestion => suggestion.user)
  suggestions: Suggestion[];

  @OneToMany(type => Userform, userform => userform.user)
  userforms: Userform[];

}

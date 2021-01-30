import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Relation } from './Relation';
import { Userform } from './Userform';

@Entity()
export class Form {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  organization: string;

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn({
    name: "created_at"
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedAt: Date;

  @OneToMany(type => Relation, relation => relation.form)
  relations: Relation[];

  @OneToMany(type => Userform, userform => userform.form)
  userforms: Userform[];

}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, ManyToOne, JoinTable } from "typeorm";
import { User } from './User';
import { Form } from './Form';
import { Group } from './Group';

@Entity()
export class Relation {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  formId: number;

  @Column()
  groupId: number;

  @CreateDateColumn({
    name: "created_at"
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedAt: Date;

  @ManyToOne(type => User, user => user.relations)
  user: User;

  @ManyToOne(type => Form, form => form.relations)
  form: Form;

  @ManyToOne(type => Group, group => group.relations)
  group: Group;

}

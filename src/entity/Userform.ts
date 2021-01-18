import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { User } from './User';
import { Form } from './Form';

@Entity()
export class Userform {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  formId: number;

  @Column({ nullable: true })
  contents: string;

  @Column('boolean', { default: false })
  isComplete: boolean;

  @CreateDateColumn({
    name: "created_at"
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedAt: Date;

  @ManyToOne(type => User, user => user.userforms)
  user: User;

  @ManyToOne(type => Form, form => form.userforms)
  form: Form;

}

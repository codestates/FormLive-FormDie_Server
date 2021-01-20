import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { User } from './User';

@Entity()
export class Suggestion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  fileURL: string;

  @Column('boolean', { default: false })
  isDone: boolean;

  @CreateDateColumn({
      name: "created_at"
  })
  createdAt: Date;

  @UpdateDateColumn({
      name: "updated_at"
  })
  updatedAt: Date;

  @ManyToOne(type => User, user => user.suggestions, { onDelete: 'CASCADE' })
  user: User;

}

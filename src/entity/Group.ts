import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Relation } from './Relation';

@Entity()
export class Group {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('boolean', { default: false })
  isDefaultGroup: boolean;

  @CreateDateColumn({
    name: "created_at"
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at"
  })
  updatedAt: Date;

  @OneToMany(type => Relation, relation => relation.group)
  relations: Relation[];

}

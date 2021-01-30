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

  @Column({ nullable: true })
  organization: string;

  @Column('boolean', { default: false })
  isDefaultGroup: boolean;

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

  @OneToMany(type => Relation, relation => relation.group)
  relations: Relation[];

}

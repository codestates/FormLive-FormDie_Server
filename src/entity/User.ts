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

  /*
   *typeORM에서의 테이블 간 관계 설정은 Entity 설정 칸에 아래처럼 있는 그대로 써주면 되어 상당히 직관적이다.
   *1대다 관계일 경우 OneToMany, 다대1 관계일 경우 ManyToOne으로 써주면 된다.
   *1대다 다대1 방향에 따라 단수형 복수형 이라던가 약간의 문법 차이가 있는데, 그 차이에 관해서는
   *이 파일과 Relation.ts 파일을 비교해보면 차이를 알 수 있을 것이다.
   */
  
  @OneToMany(type => Relation, relation => relation.user)
  relations: Relation[];

  @OneToMany(type => Suggestion, suggestion => suggestion.user)
  suggestions: Suggestion[];

  @OneToMany(type => Userform, userform => userform.user)
  userforms: Userform[];

}

import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import * as multer from 'multer';
import * as fs from 'fs';

import { Connection, createConnection, createQueryBuilder, getRepository, QueryBuilder } from "typeorm"; //login테스트 위한 임시 커넥션 생성. 나중에 index.ts에서 받아오는 방식으로 변경하기
import { Entity, EntityRepository, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable, Repository } from "typeorm";

import { Form } from "../entity/Form";
import { Group } from '../entity/Group';
import { Relation } from '../entity/Relation';
import { Suggestion } from '../entity/Suggestion';
import { User } from "../entity/User";
import { Userform } from '../entity/Userform';
import { totalmem } from 'os';

const router = express.Router();

router.get('', async (req, res, next) => {
  let sort = '', q = '', pageLimit = 10, offset = 0;
  if (!req.query.page) { //NaN 이나 입력안한 undefined일 경우,
    offset = 0;
  } else {
    offset = pageLimit * (Number(req.query.page) - 1);
  }
  if (req.query.sort === 'popular') { //조회순 검색이면.
    sort = 'Group_views'; //`ORDER BY views DESC`;   
  } else { //아니면 최신순.
    sort = `Group_updated_at`;
  }
  if (req.query.q) { //제목검색 쿼리가 있으면,
    q = String(req.query.q);
  }

  try {
    const rawGroups = await getRepository(Group)
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.relations', 'relations')
      .where("title like :title", { title: `%${q}%` })
      .andWhere("userId = :userId", { userId: req.session.passport.user })
      .skip(offset)
      .take(offset + pageLimit) //.limit(X)
      .orderBy(`${sort}`, "DESC")
      .getMany();

    const groupsCount = await getRepository(Group)
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.relations', 'relations')
      .where("title like :title", { title: `%${q}%` })
      .andWhere("userId = :userId", { userId: req.session.passport.user })
      .getCount();
    
    let content = [];
    for (let group of rawGroups) {
      let forms = [];
      for (let el of group.relations) {
        forms.push(el.formId);
      }
      content.push({
        groupId: group.id,
        title: group.title,
        description: group.description,
        views: group.views,
        isDefaultGroup: group.isDefaultGroup,
        updatedAt: group.updatedAt,
        forms
      })
    }    
    
    res.send({
      data: {
        total: groupsCount,
        content
      },
      message: "get group list success"
    });
  } catch (err) {
    console.log('not logged in');
    const rawGroups = await getRepository(Group)
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.relations', 'relations')
      .where("isDefaultGroup = :isDefaultGroup", { isDefaultGroup: 1 })
      .skip(offset)
      .take(offset + pageLimit) //.limit(X)
      .orderBy(`${sort}`, "DESC")
      .getMany();

    const groupsCount = await getRepository(Group)
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.relations', 'relations')
      .where("isDefaultGroup = :isDefaultGroup", { isDefaultGroup: 1 })
      .getCount();
    
    let content = [];
    for (let group of rawGroups) {
      let forms = [];
      for (let el of group.relations) {
        forms.push(el.formId);
      }
      content.push({
        groupId: group.id,
        title: group.title,
        description: group.description,
        views: group.views,
        isDefaultGroup: group.isDefaultGroup,
        updatedAt: group.updatedAt,
        forms
      })
    }    
    
    res.send({
      data: {
        total: groupsCount,
        content
      },
      message: "get default group list success"
    });;
  }

});

router.post('/:id', async (req, res, next) => {

});

router.post('', async (req, res, next) => {
  try {

    //Group 테이블에 제목을 등록
    const group = (await createQueryBuilder("group")
      .insert()
      .into(Group)
      .values([
        { title: req.body.title }
      ])
      .execute());

    //userId, formId, groupId를 정리해서 ORM에 넣을 수 있는 형식으로 가공
    let relationArr = [];
    for (let formId of req.body.forms) {
      relationArr.push({
        userId: req.session.passport.user,
        formId,
        groupId: group.identifiers[0].id
      })
    }

    //Relation 테이블에 그 그룹의 소유 유저와 소속됨 폼들을 등록
    await createQueryBuilder("relation")
      .insert()
      .into(Relation)
      .values(relationArr)
      .execute();
    res.send({ data: { groupId: group.identifiers[0].id, title: req.body.title, forms: req.body.forms }, message: "new user group created" })
  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }

  };
});

router.patch('', async (req, res, next) => {

});

router.delete('', async (req, res, next) => {
  try {
    //Relation 테이블에서 삭제
    const isDeleted = (await createQueryBuilder()
      .delete()
      .from(Relation)
      .where("userId = :userId", { userId: req.session.passport.user })
      .andWhere("groupId = :groupId", { groupId: req.body.groupId })
      .execute()).affected;

    //Group이 유저 생성 그룹일 경우 Group 테이블에서도 삭제
    await createQueryBuilder()
      .delete()
      .from(Group)
      .where("isDefaultGroup = :isDefaultGroup", { isDefaultGroup: 0 })
      .andWhere("id = :id", { id: req.body.groupId })
      .execute();
    if (isDeleted) {
      res.send({ data: null, message: 'form group delete complete' });
    } else {
      res.status(400).send({ data: null, message: "not deleted. maybe not exist any more?" });
    }
  } catch (err) {
    console.error(err);
    res.status(401).send({ data: null, message: "not authorized" });
  }
});

export default router;

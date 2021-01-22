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

const router = express.Router();

router.get('', async (req, res, next) => {
  let sort: 'ASC' | 'DESC', q = '', pageLimit = 10, offset = 0;
  if (!req.query.page) { //NaN 이나 입력안한 undefined일 경우,
    offset = 0;
  } else {
    offset = pageLimit * (Number(req.query.page) - 1);
  }
  if (req.query.sort === 'asc') { 
    sort = 'ASC'; // 오름차순 정렬
  } else { //아니면 최신순.
    sort = 'DESC';
  }
  if (req.query.q) { //제목검색 쿼리가 있으면,
    q = String(req.query.q);
  }

  try {
    const rawGroups = await getRepository(Group)
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.relations', 'relations')
      .where("userId = :userId", { userId: req.session.passport.user })
      .andWhere("title like :title", { title: `%${q}%` })      
      .skip(offset)
      .take(offset + pageLimit) //.limit(X)
      .orderBy(`Group_updated_at`, sort)
      .getMany();

    const groupsCount = await getRepository(Group)
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.relations', 'relations')
      .where("userId = :userId", { userId: req.session.passport.user })
      .andWhere("title like :title", { title: `%${q}%` })
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
        organization: group.organization,
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
      message: "get history list success"
    });
  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };

});

export default router;

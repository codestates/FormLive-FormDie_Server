import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import * as multer from 'multer';
import * as fs from 'fs';

import { Brackets, Connection, createConnection, createQueryBuilder, getRepository, QueryBuilder } from "typeorm"; //login테스트 위한 임시 커넥션 생성. 나중에 index.ts에서 받아오는 방식으로 변경하기
import { Entity, EntityRepository, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable, Repository } from "typeorm";

import { Form } from "../entity/Form";
import { Group } from '../entity/Group';
import { Relation } from '../entity/Relation';
import { Suggestion } from '../entity/Suggestion';
import { User } from "../entity/User";
import { Userform } from '../entity/Userform';

const router = express.Router();

router.get('', async (req, res, next) => {
  try {
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
    const rawSuggestions = await getRepository(Suggestion)
      .createQueryBuilder("suggestion")
      .where("title like :title", { title: `%${q}%` }) 
      .leftJoinAndSelect('suggestion.user', 'user')
      .skip(offset)
      .take(offset + pageLimit) //.limit(X)
      .orderBy(`Suggestion_created_at`, sort)
      .getMany();

    const suggestionCount = await getRepository(Suggestion)
      .createQueryBuilder("suggestion")
      .where("title like :title", { title: `%${q}%` }) 
      .leftJoinAndSelect('suggestion.user', 'user')
      .getCount();
    
    let content = [];
    for (let suggestion of rawSuggestions) {
      content.push({
        profileIconURL: suggestion.user.profileIconURL,
        name: suggestion.user.name,
        email: suggestion.user.email,
        date: suggestion.createdAt,
        title: suggestion.title,
        fileURL: suggestion.fileURL,
        isDone: suggestion.isDone
      })
    }

    res.send({
      data: {
        total: suggestionCount,
        content
      },
      message: "get suggestions success"
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

router.post('', async (req, res, next) => {

});

export default router;

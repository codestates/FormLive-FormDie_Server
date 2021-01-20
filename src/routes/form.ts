import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import * as multer from 'multer';
import * as fs from 'fs';

import { Connection, createConnection, createQueryBuilder, QueryBuilder } from "typeorm"; //login테스트 위한 임시 커넥션 생성. 나중에 index.ts에서 받아오는 방식으로 변경하기
import { Entity, EntityRepository, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable, Repository } from "typeorm";

import { Form } from "../entity/Form";
import { Group } from '../entity/Group';
import { Relation } from '../entity/Relation';
import { Suggestion } from '../entity/Suggestion';
import { User } from "../entity/User";
import { Userform } from '../entity/Userform';

const router = express.Router();

/**
 * 개별 폼들 리스트 받아오기 
 * req: req.session.passport.user, (queryString: q, page, sort)
 * 하드코딩된 폼 규격들 중에 q값에 맞는 것을 찾아 전송해줌
 * res: user. id, email, name, profileIconURL, isAdmin
 */
router.get('/', async (req, res, next) => {
  try {
    //일단, 사전에 세션 아이디 여부를 검증합니다.
    const user = await createQueryBuilder("user")
      .where("id = :id", { id: req.session.passport.user })
      .execute();
    //console.log(user); 유저가 존재하면,[]가 뜬다.
    if (user.length !== 0) {
      /* //SQL문을 ORM문으로 변환. 개별 form 리스트 받기
      SELECT * FROM form //폼 받아와라
      WHERE form.title = req.query.q //그중 query에 맞는 것을 찾아서.
      if(req.query.sort === 'popular'){
        sort에 따라 ORDER BY views DESC     
      } else{
        ORDER BY createdAt DESC
      }
      LIMIT 12 // 12개씩 끊지만 ~24, ~36 이렇게 바꿔야 한다?

      
      attributes: ['id', 'nickname'],
      limit: parseInt(req.query.limit, 10),
      offset: parseInt(req.query.offset, 10),

      q = '' 빈 문자열로 초기화한 다음에,
      if(req.query.q) {
        
      } else if(req.query.sort === 'popular'){

      } else if(){

      }

      */
      let sort = req.query.page;
      let q = req.query.q;
      const getUserForm = await createQueryBuilder("Userform")
        //.where(" = :", { :  })
        //.andWhere(" = :formId", { formId: req.query })
        .execute();


      //gerUserForm 다듬어서 send 할 것. data와 message로.
      return res.status(200).send(getUserForm);

    }
  } catch (e) {
    console.error(e);
    // 에러 처리를 여기서
    return next(e);
  }

});

router.get('/:id', async (req, res, next) => {

});

router.post('', async (req, res, next) => {

});

router.patch('', async (req, res, next) => {

});

//userform 테이블에서 유저가 작성한 폼 내용 삭제
router.delete('', async (req, res, next) => {
  try {
    const isDeleted = (await createQueryBuilder()
      .delete()
      .from(Userform)
      .where("userId = :userId", { userId: req.session.passport.user })
      .andWhere("formId = :formId", { formId: req.body.formId })
      .execute()).affected;
    if (isDeleted) {
      res.send({ data: null, message: 'form content delete complete' });
    } else {
      res.status(400).send({ data: null, message: "not deleted. maybe not exist any more?" });
    }
  } catch (err) {
    res.status(400).send({ data: null, message: "not authorized" });
  }

});

export default router;

/**
      return res.status(200).send( //01.19 저녁 meeting. RowDataPacket 가공하여 send로 변경.
        {
          data: {
            id: user[0].User_id,
            email: user[0].User_email,
            name: user[0].User_name,
            profileIconURL: user[0].User_profileIconURL,
            isAdmin: user[0].User_isAdmin
          },
          message: "successfully got user info"
        }
      );
 */
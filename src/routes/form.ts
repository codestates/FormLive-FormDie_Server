import * as express from 'express';
import * as bcrypt from 'bcrypt'; //비밀번호 암호화모듈 사용 필요?
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

/**
 * 개별 폼들 리스트 받아오기 
 * req: req.session.passport.user, (queryString: q, page, sort)
 * 하드코딩된 폼 규격들 중에 q값에 맞는 것을 찾아 전송해줌
 * res: form 데이터 쿼리문에 따라 응답.
 */
router.get('/', async (req, res, next) => {
  try {

    //각각의 변수 유무에 따른 분리.
    let sort = '', q = '', pageLimit = 12, offset = 0;
    //분기점. 쿼리가 있는 경우에 따라 분리.
    if (req.query.sort === 'popular') { //조회순 검색이면.
      sort = 'Form_views'; //`ORDER BY views DESC`;   
    } else { //아니면 최신순.
      sort = `updated_at`; //Form_updated_at도 테스트 필요 가능성
    }
    //주의! 페이징할때 검색결과값이 12 이하이면, req.query.page에 2이상 입력시 0이 반환됩니다.
    if (!req.query.page) { //NaN 이나 입력안한 undefined일 경우,
      offset = 0;
    } else {
      offset = pageLimit * (Number(req.query.page) - 1); //or parseInt(req.query.offset, 12);
    }
    let getForm = []; //배열로 일괄 초기화 변경
    if (req.query.q) { //제목검색 쿼리가 있으면,
      q = String(req.query.q);

      getForm = await createQueryBuilder("form")
        //{ title: `%${q}%` } like문 추가 필요.
        .where("title like :title", { title: `%${q}%` })
        .skip(offset)
        .take(pageLimit) //.limit(X)
        .orderBy(`${sort}`, "DESC")
        .execute();
    } else { //없으면
      getForm = await createQueryBuilder("form")
        //.where("title = :title", { title: `%${q}%` })
        .skip(offset)
        .take(pageLimit) //.limit(X)
        .orderBy(`${sort}`, "DESC")
        .execute();
    }
    //총 form 갯수가 저장된 변수. 처음에 썼던 SUM은 호환성 문제로 getCount로 변경
    let total = await createQueryBuilder("form")
      .where("title like :title", { title: `%${q}%` })
      .getCount();

    //for 문 반복으로 전체 가공 d완료.

    let content = [];
    for (let el of getForm) {
      content.push({
        formId: el.Form_id,
        title: el.Form_title,
        description: el.Form_description,
        organization: el.Form_organization,
        views: el.Form_views,
        updated_at: el.Form_updated_at
      });
    }

    return res.status(200).send(
      {
        data: {
          total,
          content
        },
        message: "get form list success"
      }
    );

  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };

});


//get /:id 한 번 씩 올 때마다 view가 1개씩 올라감
router.get('/:id', async (req, res, next) => {
  try {
    const viewcounter = await createQueryBuilder()
      .update(Form)
      .set({ views: () => "views + 1", updatedAt: () => "updated_at" })
      .where("id = :id", { id: req.params.id })
      .execute();
    if (!viewcounter.affected) {
      return res.status(400).send({
        data: null,
        message: 'form not exist'
      })
    }
    const userform = (await createQueryBuilder("userform")
      .where("userId = :userId", { userId: req.session.passport.user })
      .andWhere("formId = :formId", { formId: req.params.id })
      .execute())[0];
    const form = (await createQueryBuilder("form")
      .where("id = :id", { id: req.params.id })
      .execute())[0];
    if (!userform || userform.length === 0) {
      return res.send({ data: null, message: 'userform data blank' });
    } else {
      return res.send({
        data: {
          formId: form.Form_id,
          title: form.Form_title,
          description: form.Form_description,
          organization: form.Form_organization,
          views: form.Form_views,
          isComplete: userform.Userform_isComplete,
          updated_at: form.Form_updated_at,
          contents: JSON.parse(userform.Userform_contents)
        },
        message: "get form contents success"
      })
    }
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
  try {
    await createQueryBuilder("userform")
      .insert()
      .into(Userform)
      .values([{
        userId: req.session.passport.user,
        formId: req.body.formId,
        isComplete: req.body.isComplete,
        contents: JSON.stringify(req.body.contents)
      }])
      .execute();
    res.send({ data: null, message: "userform saved" })
  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: "userform duplicate. please use PATCH method to edit." })
    }

  };
});

router.patch('', async (req, res, next) => {
  try {
    await createQueryBuilder("userform")
      .update(Userform)
      .set({
        isComplete: req.body.isComplete,
        contents: JSON.stringify(req.body.contents)
      })
      .where({
        userId: req.session.passport.user,
        formId: req.body.formId
      })
      .execute();
    res.send({ data: null, message: "userform edit success" })
  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };

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

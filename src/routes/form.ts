import * as express from 'express';
import * as passport from 'passport';
import { Connection, createConnection, createQueryBuilder, QueryBuilder } from "typeorm"; //login테스트 위한 임시 커넥션 생성. 나중에 index.ts에서 받아오는 방식으로 변경하기
import { Entity, EntityRepository, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable, Repository } from "typeorm";
import { Relation } from '../entity/Relation';
import { Suggestion } from '../entity/Suggestion';
import { Userform } from '../entity/Userform';
import { User } from "../entity/User";


const router = express.Router();

router.get('', async (req, res, next) => {

});


//get /:id 한 번 씩 올 때마다 view가 1개씩 올라감
router.get('/:id', async (req, res, next) => {
  try {
    const userform = (await createQueryBuilder("userform")
      .where("userId = :userId", { userId: req.session.passport.user })
      .andWhere("formId = :formId", { formId: req.params.id })
      .execute())[0];
    if (!userform || userform.length === 0) {
      res.status(400).send({ data: null, message: 'form not exist' });
    } else {
      res.send({
        data: {
          title: '',
          contents: JSON.parse(userform.Userform_contents)
        },
        message: "get form contents success"
      })
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ data: null, message: "not authorized" });
  }

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
    res.send({ data: null, message: "userform saved"})
  } catch (error) {
    console.error(error);
    res.status(400).send({ data: null, message: "not authorized" });
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
    res.send({ data: null, message: "userform edit success"})
  } catch (error) {
    console.error(error);
    res.status(400).send({ data: null, message: "not authorized" });
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
  } catch (err) {
    res.status(400).send({ data: null, message: "not authorized" });
  }
  
});

export default router;

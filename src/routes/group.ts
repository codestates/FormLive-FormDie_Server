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


/**
 * 폼그룹 리스트 받아오기 
 * req: /req.session.passport.user, (queryString: q, page, sort)
 *      /폼그룹들 중에 q값에 맞는 것을 찾아 전송해줌
 * res: /group 데이터 쿼리문에 따라 응답.
 */
router.get('/', async (req, res, next) => {
  try {
    //일단, 사전에 세션 아이디 여부를 검증합니다.
    const user = await createQueryBuilder("user")
      .where("id = :id", { id: req.session.passport.user })
      .execute();
    //console.log(user); 유저가 존재하면,[]가 뜬다.
    if (user.length !== 0) {
      //각각의 변수 유무에 따른 분리.
      let sort = '', q = '', pageLimit = 12, offset = 0;
      //분기점. 쿼리가 있는 경우에 따라 분리.
      if (req.query.sort === 'popular') { //조회순 검색이면.
        sort = 'views'; //`ORDER BY views DESC`;   
      } else { //아니면 최신순.
        sort = `updated_at`;
      }
      //주의! 페이징할때 검색결과값이 12 이하이면, req.query.page에 2이상 입력시 0이 반환됩니다.
      if (!req.query.page) { //NaN 이나 입력안한 undefined일 경우,
        offset = 0;
      } else {
        offset = pageLimit * (Number(req.query.page) - 1); //or parseInt(req.query.offset, 12);
      }

      /**
       * relations 테이블에서 admin의 userId와 해당 유저의 userId로 필터링을 한 후,
       * 그 groupId를 이용하여 groups 테이블에서 title과 description을 가져온다.
       * 결과적으로 groupId, title, description, formId를 클라이언트에게 보내준다.
       * taskCard 외 gitbook 내용 추가. relation.formid도 필요하다
       * + views, updated_at 추가, 그룹에 담긴 총갯수
       */
      let getGroupInfo = []; //배열로 일괄 초기화 변경
      let getFormidOfGroup = [];
      let getGroupCount = [];

      if (req.query.q) { //제목검색 쿼리가 있으면,
        q = String(req.query.q);

        getGroupInfo = await createQueryBuilder()
          .select("id")
          .addSelect("title")
          .addSelect("description")
          .addSelect("views") //group.views
          .addSelect("updated_at")
          .from(Group, "group")
          .where("title like :title", { title: `%${q}%` })
          .andWhere(getGroupId => {
            let subQuery = getGroupId.subQuery()
              .select("groupId")
              .from(Relation, "relation")
              .where("userId = :userId", { userId: req.session.passport.user })
              .getQuery();
            return "group.id IN " + subQuery;
          })
          .skip(offset)
          .take(offset + pageLimit) //.limit(X)
          .orderBy(`${sort}`, "DESC")
          .execute();

        getFormidOfGroup = await createQueryBuilder()
          .select("formId")
          .addSelect("updated_at")
          .from(Relation, "relation")
          .where("userId = :userId", { userId: req.session.passport.user })
          .execute();
        //'SELECT COUNT(groupId) FROM `relation` `relation` 
        // WHERE userId = ? AND group.id
        // IN (SELECT groupId FROM `relation` `relation`
        // WHERE userId = ?)'  
        // && select formId, updated_at from relation where userid = ?
        // && select id, title, description, views, updated_at
        // from group where title LIKE %q% and ~~~~~~~~~~~
        // -> 분리 결정

        //그룹카운트를 받아오는 where절에 if문으로 분기를 가르면서 동시에 join을 붙이는 난이도로 인해 쿼리 분리.
        //또는, userId 가 3개의 테이블에 있어서 유저아이디를 통해 RELATION JOIN을 한다면???
        //잠깐... Group 테이블에는 userId가 없다.
        //그러므로 폼그룹의 전체 갯수를 잡으면 '남의 폼그룹' 인지, '자신'의 폼그룹인지는
        //Relation 테이블을 통해서 잡아도 물리적으로 섞일 가능성이 있다!?
        getGroupCount = await createQueryBuilder()
          .select("COUNT(groupId)")
          .from(Relation, "relation")
          .where("userId = :userId", { userId: req.session.passport.user })
          .execute();

      } else { //제목검색 쿼리(where LIKE)가 없으면

        getGroupInfo = await createQueryBuilder()
          .select("id")
          .addSelect("title")
          .addSelect("description")
          .addSelect("views") //group.views
          .addSelect("updated_at")
          .from(Group, "group")
          .where("title like :title", { title: `%${q}%` })
          .andWhere(getGroupId => {
            let subQuery = getGroupId.subQuery()
              .select("groupId")
              .from(Relation, "relation")
              .where("userId = :userId", { userId: req.session.passport.user })
              .getQuery();
            return "group.id IN " + subQuery;
          })
          .skip(offset)
          .take(offset + pageLimit) //.limit(X)
          .orderBy(`${sort}`, "DESC")
          .execute();

        getFormidOfGroup = await createQueryBuilder()
          .select("formId")
          .addSelect("updated_at")
          .from(Relation, "relation")
          .where("userId = :userId", { userId: req.session.passport.user })
          .execute();

        getGroupCount = await createQueryBuilder()
          .select("COUNT(groupId)")
          .from(Relation, "relation")
          .where("userId = :userId", { userId: req.session.passport.user })
          .execute();

      }

      return res.status(200).send(
        {
          data: //이 부분에 대한 data 가공 후처리 작업이 필요. (현재는 다 json 안의 json 중첩 형태.)
          {
            getGroupCount,
            getGroupInfo,
            getFormidOfGroup
          },
          message: "get form list success"
        }
      );
    }
  } catch (e) {
    console.error(e);
    // 에러 처리를 여기서
    return next(e);
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

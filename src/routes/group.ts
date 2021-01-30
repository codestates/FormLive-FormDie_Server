import * as express from 'express';
import { Brackets, createQueryBuilder, getRepository } from "typeorm";
import { Group } from '../entity/Group';
import { Relation } from '../entity/Relation';

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
      .leftJoinAndSelect('relations.form', 'form')
      .leftJoinAndSelect('form.userforms', 'userforms', 'userforms.userId = :userId', { userId: req.session.passport.user })
      .where("group.title like :title", { title: `%${q}%` })
      .andWhere(new Brackets(qb => {
        qb.where("isDefaultGroup = :isDefaultGroup", { isDefaultGroup: 1 });
      }))  
      .skip(offset)
      .take(pageLimit) //.limit(X)
      .orderBy(`${sort}`, "DESC")
      .getMany();

    const groupsCount = await getRepository(Group)
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.relations', 'relations')
      .where("title like :title", { title: `%${q}%` })
      .andWhere(new Brackets(qb => {
        qb.where("isDefaultGroup = :isDefaultGroup", { isDefaultGroup: 1 });
      }))  
      .getCount();

    let content = [];
    for (let group of rawGroups) {
      let forms = [];
      for (let el of group.relations) {
        forms.push(JSON.stringify({
          id: el.formId,
          title: el.form.title,
          isComplete: el.form.userforms.length !== 0 ? el.form.userforms[0].isComplete : null,
          contents: el.form.userforms.length !== 0 ? JSON.parse(el.form.userforms[0].contents) : null
        }));
      }
      forms = Array.from(new Set(forms));
      forms = forms.map(form => JSON.parse(form));
      content.push({
        groupId: group.id,
        title: group.title,
        description: group.description,
        organization: group.organization,
        views: group.views,
        isDefaultGroup: group.isDefaultGroup,
        updatedAt: group.updatedAt,
        forms: forms
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
      .leftJoinAndSelect('relations.form', 'form')
      .where("isDefaultGroup = :isDefaultGroup", { isDefaultGroup: 1 })
      .skip(offset)
      .take(pageLimit) //.limit(X)
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
        forms.push(JSON.stringify({
          id: el.formId,
          title: el.form.title
        }));
      }
      forms = Array.from(new Set(forms));
      forms = forms.map(form => JSON.parse(form));
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
      message: "get default group list success"
    });;
  }

});

router.get('/:id', async (req, res, next) => {
  try {
    const viewcounter = await createQueryBuilder()
      .update(Group)
      .set({ views: () => "views + 1", updatedAt: () => "updated_at" })
      .where("id = :id", { id: req.params.id })
      .execute();
    if (!viewcounter.affected) {
      return res.status(400).send({
        data: null,
        message: 'group not exist'
      })
    } else {
      const isExisting = await getRepository(Relation)
        .findOne({
          where: {
            groupId: req.params.id,
            userId: req.session.passport.user
          }
        });
      if (isExisting) {
        return res.send({ data: null, message: 'all success' });        
      } else {
        const formIds = await getRepository(Relation)
          .createQueryBuilder('relation')
          .select(['relation.formId'])
          .where('groupId = :groupId', { groupId: req.params.id })
          .andWhere('userId = :userId', { userId: 0 })
          .getMany();

        let relationArr = [];
        for (let { formId } of formIds) {
          relationArr.push({
            userId: req.session.passport.user,
            formId,
            groupId: req.params.id
          })
        }

        await createQueryBuilder("relation")
          .insert()
          .into(Relation)
          .values(relationArr)
          .execute();

        return res.send({ data: null, message: 'all success' });
      }
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
      });
    }

    //Relation 테이블에 그 그룹의 소유 유저와 소속됨 폼들을 등록
    await createQueryBuilder("relation")
      .insert()
      .into(Relation)
      .values(relationArr)
      .execute();

    const groupForms = await getRepository(Group)
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.relations', 'relations')
      .leftJoinAndSelect('relations.form', 'form')
      .leftJoinAndSelect('form.userforms', 'userforms', 'userforms.userId = :userId', { userId: req.session.passport.user })
      .where("group.id = :id", { id: group.identifiers[0].id })
      .getOne();

    let forms = [];
    for (let el of groupForms.relations) {
      forms.push({
        id: el.formId,
        title: el.form.title,
        isComplete: el.form.userforms.length !== 0 ? el.form.userforms[0].isComplete : null,
        contents: el.form.userforms.length !== 0 ? JSON.parse(el.form.userforms[0].contents) : null
      });
    }
    
    res.send({ data: { groupId: group.identifiers[0].id, title: req.body.title, forms }, message: "new user group created" })
  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };
});

/**
 * 유저가 폼 그룹 이름을 수정 할 때
 * req: 헤더의 session쿠키, body의 title
 * title 수정 Only
 * res: 성공시 message: "formGroup edit success",
 *      실패시 error.next 리턴
 */
router.patch('', async (req, res, next) => {
  try {
    await createQueryBuilder("group")
      .update(Group)
      .set({
        title: req.body.title
      })
      .where({
        id: req.body.groupId
      })
      .execute();
    res.send({ data: null, message: "formGroup edit success" })

  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };
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

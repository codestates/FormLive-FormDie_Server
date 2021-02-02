import * as express from 'express';
import { getRepository } from "typeorm";
import { Group } from '../entity/Group';

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
      .leftJoinAndSelect('relations.form', 'form')
      .leftJoinAndSelect('form.userforms', 'userforms', 'userforms.userId = :userId')
      .where("relations.userId = :userId", { userId: req.session.passport.user })
      .andWhere("group.title like :title", { title: `%${q}%` })      
      .skip(offset)
      .take(pageLimit) //.limit(X)
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
        forms.push({
          id: el.formId,
          title: el.form.title,
          organization: el.form.organization,
          isComplete: el.form.userforms.length !== 0 ? el.form.userforms[0].isComplete : null,
          contents: el.form.userforms.length !== 0 ? JSON.parse(el.form.userforms[0].contents) : null
        });
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

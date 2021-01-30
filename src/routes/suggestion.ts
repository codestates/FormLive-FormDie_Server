import * as express from 'express';
import * as multer from 'multer';
import { createQueryBuilder, getRepository } from "typeorm";
import { Suggestion } from '../entity/Suggestion';

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

/**
 * suggestion 파일 업로드
 * req: req.session.passport.user, fileURL
 * multer를 통해 데이터를 받아서 server에 저장. 경로는 /uploads
 * res: data, message: "suggestion upload done"
 */
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  }),
});
router.post('', upload.single('doc'), async (req, res, next) => {
  /*
  const suggestion1 = (await createQueryBuilder("suggestion")
    .where("id = :id", { id: req.session.passport.user })
    .execute())[0];
  let suggestionFile: string;
  if (suggestion1.Suggestion_fileURL) {
    suggestionFile = suggestion1.Suggestion_fileURL.split('/')[1];
  }
  //suggestionFile = suggestion1.Suggestion_fileURL.split('')[1];
  */

  let fileURL: string = process.env.SERVER_URL + '/suggestion/' + req.file.filename;

  await createQueryBuilder("suggestion")
    .insert()
    .into(Suggestion)
    .values([{
      fileURL: fileURL,
      userId: req.session.passport.user,
      title: req.body.title
    }])
    .execute();

  return res.send({ data: { title: req.body.title }, message: "suggestion upload done" })

});
router.get('/:id', (req, res) => { res.sendFile(req.params.id, { root: 'uploads/' }) });

export default router;

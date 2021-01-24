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


});

/**
 * suggestion 파일 업로드
 * req: req.session.passport.user, fileURL
 * multer를 통해 데이터를 받아서 server에 저장. 경로는 /uploads
 * res: data, message: "suggestion upload done"
 */
let upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
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

  try {
    fs.unlinkSync('./uploads/'); //suggestionFile
  } catch (err) {
    console.error(err);
  }
  let fileURL: string = process.env.SERVER_URL + '/suggestion' + req.file.filename;

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

export default router;

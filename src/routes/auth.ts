import * as express from 'express';
import * as passport from 'passport';
import * as env from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as multer from 'multer';
import * as fs from 'fs';
import * as OAuth from "../passport/naverOAuth";

import { Brackets, Connection, createConnection, createQueryBuilder, getRepository, QueryBuilder } from "typeorm"; //login테스트 위한 임시 커넥션 생성. 나중에 index.ts에서 받아오는 방식으로 변경하기
import { Entity, EntityRepository, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable, Repository } from "typeorm";

import { Form } from "../entity/Form";
import { Group } from '../entity/Group';
import { Relation } from '../entity/Relation';
import { Suggestion } from '../entity/Suggestion';
import { User } from "../entity/User";
import { Userform } from '../entity/Userform';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('http://localhost:3000/home');
});

router.get('/kakao', async (req, res, next) => {

});

router.get('/kakao/callback', async (req, res, next) => {

});

router.get('/naver', passport.authenticate('naver', { successRedirect: '/callback', failureRedirect: '/' })

);

router.get('/naver/callback', async (req, res, next) => {
  try {
    passport.authenticate('naver', function (err, user) {
      console.log('passport.authenticate(naver)실행');

      req.logIn(user, async function (err) {
        if (err) {
          console.error(err);
          return next(err);
        }
        console.log('naver/callback user : ', user);
        //return res.redirect('https://yangsikdang.ml:5000/');
        return res.redirect('http://localhost:5000');
      });
    })(req, res);

  }
  catch (e) {
    return next(e);
  }

});

export default router;

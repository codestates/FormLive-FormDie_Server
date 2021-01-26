import * as passport from 'passport';
import { createQueryBuilder } from "typeorm";
import local from './local';
import google from './google';
import naver from './naverOAuth';
import kakao from './kakao';

export default () => {
  //로그인 할 때 한 번 실행
  passport.serializeUser((user: any, done) => {
    done(null, user.User_id);
  });

  //유저 관련에 매번 실행됨
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await createQueryBuilder("user")
        .where("id = :id", { id })
        .execute();
      return done(null, user); //이것이 req.user가 되는데 따로 타이핑을 해줘야 함.
    } catch (err) {
      console.error(err);
      return done(err);
    }
  });

  local();
  google();
  naver();
  kakao();
}
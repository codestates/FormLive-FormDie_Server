import * as passport from 'passport';
import { createQueryBuilder } from "typeorm";
import local from './local';
import google from './google';
import naver from './naverOAuth';
import kakao from './kakao';
/**
 * passport를 사용할 전략은 3단계로 나뉘어졌습니다.
 * 1. 인증 strategies
 * 2. app 미들웨어들
 * 3. serialize, Sessions
 */
//3. /passport/local.ts에서 2까지 완료되었으면 거기서 callback 함수가 실행되어
// 두번째 인자로 넣은 정보들을 serializeUser 미들웨어 함수로 전달.
export default () => {
  //로그인 할 때 한 번 실행
  passport.serializeUser((user: any, done) => {
    //serializeUser는 전달받은 객체를 세션에 저장하는 역할을 합니다.
    done(null, user.User_id);
  });

  //유저 관련에 매번 실행됨
  //이 deserializeUser는 서버로 들어오는 요청마다 세션 정보가 유효한지를 검사하는 역할을 합니다.
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
  //여기서 OAuth용 ts파일에서 export된 정보들을 (de)serializeUser를 통해 받아서 처리합니다.
  local();
  google();
  naver();
  kakao();
}
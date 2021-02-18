import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { createQueryBuilder } from "typeorm";
/**
 * passport를 사용할 전략은 3단계로 나뉘어 졌습니다.
 * 1. 인증 strategies
 * 2. app 미들웨어들
 * 3. serialize, Sessions
 */
//1. 우리 서버에서 google로 인증 요청을 보내는 것을 passport가 대신하기 때문에
// 해당 인증 정보를 사전에 세팅하는 과정이라고 보면 됩니다.
//2. 주요 app 미들웨어로는 strategy, passport 모듈과 typeorm import
export default () => {
  // passport에서 사용하도록 strategy를 세움.
  passport.use('local', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    //콜백으로 쓸 비동기 함수에는 accessToken 대신 클라우드의 DB와 연결되어 실행되는 로직 삽입.
    //OAuth용 원본은 accessToken, refreshToken, profile, cb
    try {
      const user = (await createQueryBuilder("user")
        .where("email = :email", { email })
        .execute())[0];
      if (!user || user.length === 0) {
        return done(null, false, { message: 'email address not exist' });
      }
      const result = await bcrypt.compare(password, user.User_password);
      if (result) {
        //여기까지 마치면, /passport/index.ts로 넘어갑니다.
        return done(null, user);
      }
      return done(null, false, { message: 'wrong password' });
    } catch (e) {
      console.error(e);
      return done(e);
    }
  }));
};

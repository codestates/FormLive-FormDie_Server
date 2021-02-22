import * as passport from 'passport';
import { createQueryBuilder } from "typeorm";
import { Strategy } from 'passport-naver'; // = require('passport-naver').Strategy;
import { User } from "../entity/User";

/**
 * 2-1. index.ts에서 3단계까지 오면, 마지막에 naver(); 와 같이, 각 OAuth 및 로컬의 처리함수들을 모아서
 * 처리하는 것을 볼 수 있습니다.
 * 이것들은 1. 인증 strategies, 2. app 미들웨어들 부분을 한군데에 몰아넣지 않고,
 * 각각의 로직을 분리하여 관리하기 위함입니다.
 * 그러므로 이 구현방식은 local.ts와 비슷하되, 세부사항은 각 서비스 제공자의 API, 즉 인터페이스에 맞추어
 * 구현해야 합니다.
 */
//
// ex> Naver 네아로 API 방식입니다.
export default () => {
  const naverKey = { //ID, Secret, callbackURL은 OAuth2.0 만국공통.
    clientID: process.env.NAVER_CLIENTID,
    clientSecret: process.env.NAVER_SECRETID,
    callbackURL: `${process.env.SERVER_URL}/auth/naver/callback`,
  };
  //하지만 passport.use 내부 Strategy에서부터 각 서비스 제공자의 스펙에 맞추어 작성해야 합니다.
  passport.use('naver', new Strategy(naverKey, async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    const { //네이버에서는 _json에 id, provider를 제외한 모든 것이 담겨있고, Type까지 정해져 있으나 google처럼 정해지지 않은 곳이 더 많습니다.
      _json: { email, profile_image, nickname }
    } = profile;

    //네이버 닉네임을 설정하지 않은 '신규' 사용자의 경우, 에러를 뿜뿜...
    async function undefinedNameCheck(nickname) {
      if (typeof nickname === undefined) {
        return 'Please set your nickname';
      }
    }

    try {
      const users = (await createQueryBuilder("user")
        .where("email = :email", { email })
        .execute());
      for (let user of users) {
        if (user && user.User_password === null && user.User_email.split('@')[1] === 'naver.com') {
          return done(null, user)
        }
      }

      undefinedNameCheck(nickname);
      // 별명까지 서비스제공자를 통해 있는 것으로 확인되었으면, 회원가입 실행.
      const newUser = (await createQueryBuilder("user")
        .insert()
        .into(User)
        .values([{
          email,
          //name: 'guest2',
          name: nickname || email.split('@')[0], // 네이버 이름이 없는 경우...
          profileIconURL: profile_image
        }])
        .execute()).identifiers[0];

      const userId = { User_id: newUser.id }
      return done(null, userId);

    } catch (e) {
      console.log(e);
      return done(e);
    };
  }

  ))
}

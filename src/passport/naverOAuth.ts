import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
//import { Strategy } from 'passport-local';
import { Connection, createConnection, createQueryBuilder, QueryBuilder } from "typeorm";
import { Strategy } from 'passport-naver'; // = require('passport-naver').Strategy;
import { User } from "../entity/User";


export default () => {
  const naverKey = {
    clientID: process.env.NAVER_CLIENTID,
    clientSecret: process.env.NAVER_SECRETID,
    callbackURL: `${process.env.SERVER_URL}/auth/naver/callback`,
  };

  passport.use('naver', new Strategy(naverKey, async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    const {
      _json: { email, profile_image, nickname }
    } = profile;

    async function undefinedNameCheck(nickname) {
      if (typeof nickname === undefined) { //네이버 닉네임을 설정하지 않은 '신규' 사용자의 경우, 에러를 뿜뿜...
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

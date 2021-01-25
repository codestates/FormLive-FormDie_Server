import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
//import { Strategy } from 'passport-local';
import { Connection, createConnection, createQueryBuilder, QueryBuilder } from "typeorm";
import { Strategy } from 'passport-naver'; // = require('passport-naver').Strategy;
import { User } from "../entity/User";


export default () => {
  const naverKey = {
    clientID: "uF0x7bdx9AXI73Sl0FHb",
    clientSecret: "yQ58ECtPq6",
    callbackURL: 'http://localhost:5000/auth/naver/callback'//'https://yangsikdang.ml:5000/auth/naver/callback' http://localhost:5000/auth/naver/callback
  };
  /*
  / -by passport-naver node-module의 index.d.ts에 정의됨.
  / issue detected: 프로필 설정을 안한 레알 '신규' 네이버 아이디는 가입상태가 이렇다.
  / 필수요소 택1인 displayName, nickname(실명과 별명)은
  / 받아올수 없으니 '별명을입력해주세요' 로 하드코딩하고 PATCH /user 에서 수정하게 유도한다?
  profileNewbee = {
    provider: 'naver',
    id: '1920xxxxx',
    displayName: undefined,
    emails: [ { value: 'roqkf9210@naver.com' } ],
    _json: {
    email: 'roqkf9210@naver.com',
    nickname: undefined,
    profile_image: undefined,
    age: undefined,
    birthday: undefined,
    id: '1920xxxxx'
  }}

  profileNormal = {
    provider: 'naver',
    id: '476xxxxx',
    displayName: undefined,
    emails: [ { value: 'hsk9210@naver.com' } ],
    _json: {
      email: 'hsk9210@naver.com',
      nickname: undefined,
      profile_image: 'https://ssl.pstatic.net/static/pwe/address/img_profile.png',
      age: '20-39',
      birthday: '10-10',
      id: '476xxxxx'
    }
  }

  */

  passport.use('naver', new Strategy(naverKey, async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    const {
      _json: { email, profile_image, nickname }
    } = profile;

    async function undefinedNameCheck(nickname) {
      if (typeof nickname === undefined) { //네이버 닉네임을 설정하지 않은 '신규' 사용자의 경우, 에러를 뿜뿜...
        //profile._json.nickname = 'Please set your nickname';
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
          name: nickname, // 네이버 이름이 없는 경우...
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


    /*
    catch (e) {
      console.log(e);
      return done(e);
    };
    */

    /*
    User.findOne({
      'naver.id': profile.id
    }, function (err, user) {
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.displayName,
          provider: 'naver',
          naver: profile._json
        });
        user.save(function (err) {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
  */
    /*
    async (email, password, done) => {
      try {
        const user = (await createQueryBuilder("user")
          .where("email = :email", { email })
          .execute())[0];
        if (!user || user.length === 0) {
          return done(null, false, { message: 'email address not exist' });
        }
        const result = await bcrypt.compare(password, user.User_password);
        if (result) {
          return done(null, user);
        }
        return done(null, false, { message: 'wrong password' });
      } catch (e) {
        console.error(e);
        return done(e);
      }
    }));
    */

  ))
}

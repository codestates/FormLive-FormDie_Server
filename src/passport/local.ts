import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { Connection, createConnection, createQueryBuilder, QueryBuilder } from "typeorm";


export default () => {
  passport.use('local', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    try {
      const user = (await createQueryBuilder("user")
      .where("user.email = :email", { email })
      .execute())[0];
      console.log(user);
      if (user.length === 0) {
        return done(null, false, { message: '존재하지 않는 사용자입니다!' });
      }
      const result = await bcrypt.compare(password, user.User_password);
      if (result) {
        return done(null, user);
      }
      return done(null, false, { message: '비밀번호가 틀립니다.' });
    } catch (e) {
      console.error(e);
      return done(e);
    }
  }));
};

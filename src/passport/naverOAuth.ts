import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
//import { Strategy } from 'passport-local';
import { Connection, createConnection, createQueryBuilder, QueryBuilder } from "typeorm";
import { Strategy } from 'passport-naver'; // = require('passport-naver').Strategy;
let NaverStrategy2 = require('passport-naver').Strategy;

export default () => {
  const naverKey = {
    clientID: "uF0x7bdx9AXI73Sl0FHb",
    clientSecret: "yQ58ECtPq6",
    callbackURL: 'https://yangsikdang.ml:5000/naver/callback'
  };

  passport.use('naver', new Strategy(naverKey, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = (await createQueryBuilder("user")
        .where("email = :email", { accessToken })
        .execute())[0];
      if (!user || user.length === 0) {
        return done(null, false, { message: 'email address not exist' });
      }
      return done(null, user);


    }
    catch (e) {
      console.log(e);
      return done(e);
    };

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


  }));
};

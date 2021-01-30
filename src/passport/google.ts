import * as passport from 'passport';
import { Strategy } from 'passport-google-oauth20'
import { createQueryBuilder } from "typeorm";
import { User } from "../entity/User";

export default () => {
  passport.use('google',
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENTID,
        clientSecret: process.env.GOOGLE_SECRETID,
        callbackURL: `${process.env.SERVER_URL}/auth/google/callback`
      },
      async function (accessToken, refreshToken, profile, cb) {
        const {
          _json: { picture, name, email }
        } = profile;
        try {
          const users = (await createQueryBuilder("user")
            .where("email = :email", { email })
            .execute());
          for (let user of users) {
            if (user && user.User_password === null && user.User_email.split('@')[1] === 'gmail.com') {
              return cb(null, user)
            }
          }
          const newUser = (await createQueryBuilder("user")
            .insert()
            .into(User)
            .values([{
              email,
              name,
              profileIconURL: picture
            }])
            .execute()).identifiers[0];

          const userId = { User_id: newUser.id }
          return cb(null, userId);

        } catch (error) {
          return cb(error)
        }
      }
    )
  )
}

import * as passport from 'passport';
import { Strategy } from 'passport-kakao';
import { createQueryBuilder } from "typeorm";
import { User } from "../entity/User";

export default () => {
  passport.use('kakao',
    new Strategy(
      {
        clientID: process.env.KAKAO_CLIENTID,
        clientSecret: '',
        callbackURL: `${process.env.SERVER_URL}/auth/kakao/callback`
      },
      async function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        const {
          _json: { id, properties: {
            nickname, thumbnail_image
          } }
        } = profile;
        try {
          const users = (await createQueryBuilder("user")
            .where("email = :email", { email: "Kakao " + id })
            .execute());
          for (let user of users) {
            if (user && user.User_password === null && user.User_email.split(' ')[0] === 'Kakao') {
              return cb(null, user)
            }
          }
          const newUser = (await createQueryBuilder("user")
            .insert()
            .into(User)
            .values([{
              email: "Kakao " + id,
              name: nickname,
              profileIconURL: thumbnail_image
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

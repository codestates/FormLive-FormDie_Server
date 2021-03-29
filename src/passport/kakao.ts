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
          /* 카카오의 경우, email을 받아오려면 고객 동의를 따로 받아야 해서 email을 아예 받아오지 않도록 설계.
           * 대신 카카오의 고유 숫자ID를 받아와서 DB의 email 칸에 "Kakao 00000" 같은 형식으로 등록하여 그 회원만의 고유 넘버로 구분 가능하도록 했습니다.
           * 사실 이대로도 구분에 별 문제는 없지만, 만약 나중에 DB를 재설계할 일이 생긴다면,
           * 아예 DB에 카카오인지 구글인지 네이버인지 소셜로그인 여부를 저장해놓는 칼럼을 한 줄 만들어 놓으면 더 편할 것 같긴 합니다.
           */
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

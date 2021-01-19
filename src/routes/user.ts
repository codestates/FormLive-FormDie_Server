import * as express from 'express';
import * as bcrypt from 'bcrypt'; //비밀번호 암호화모듈 사용 필요?
import * as passport from 'passport';
import { Connection, createConnection, createQueryBuilder, QueryBuilder } from "typeorm"; //login테스트 위한 임시 커넥션 생성. 나중에 index.ts에서 받아오는 방식으로 변경하기
import { Entity, EntityRepository, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToMany, JoinTable, Repository } from "typeorm";
import { Relation } from '../entity/Relation';
import { Suggestion } from '../entity/Suggestion';
import { Userform } from '../entity/Userform';
import { User } from "../entity/User";

// @EntityRepository(User)
// export class userModel extends Repository<User> {

//     findByName(email: string, password: string) {
//         return this.createQueryBuilder("user")
//             .where("user.email = :email", { email })
//             .andWhere("user.password = :password", { password })
//             .getMany();
//     }

// }
//const newUsers = await userModel.find({ isActive: true });
//const timber = await userModel.findOne({ firstName: "Timber", lastName: "Saw" });
//
const router = express.Router();

router.get('', async (req, res, next) => {

});
/**
 * 회원가입(로컬)
 * req: email, name, password
 * res: 미정?(추후 gitbook 참조)
 */
router.post('/', async (req, res, next) => {
  try {
    //sequelize의 findOne 대신 typeorm의 createQueryBuilder입니다.
    const exUser = await createQueryBuilder("user")
      .where("user.email = :email", { email: req.body.email })
      .execute();
    //console.log(exUser); 성공시 []가 뜬다.
    if (exUser.length !== 0) {
      console.log('이미 사용중인 아이디로 회원가입 시도 탐지');
      return res.status(403).send('이미 사용중인 아이디입니다.');
    }
    //bcrypt는 테스트 필요.
    const hashedPassword = await bcrypt.hash(req.body.password, 12); // salt는 10~13 사이로
    const newUser = await createQueryBuilder("user")
      .insert()
      .into(User)
      .values([
        { email: req.body.email, name: req.body.name, password: hashedPassword },
      ])
      .execute();
    console.log(newUser); //밑의 콘솔로그는 터미널에서 회원가입정보 확인 출력용입니다.
    console.log(`회원가입 신청내역입니다 : email: ${req.body.email}, name: ${req.body.name}, password(암호화됨): ${hashedPassword}`);

    return res.status(200).json(newUser);
  } catch (e) {
    console.error(e);
    // 에러 처리를 여기서
    return next(e);
  }
});
/**
 * 회원탈퇴(로컬)
 * req: email, password
 */
router.delete('/', async (req, res, next) => {
  try {
    //일단, 사전에 삭제할 이메일이 존재하는지 확인합니다.
    const exUser = await createQueryBuilder("user")
      .where("user.id = :id", { id: req.user })
      .execute();
    //console.log(exUser); 삭제할 이메일이 존재하면,[]가 뜬다.
    if (exUser.length !== 0) {
      const delUser = await createQueryBuilder("user")
        .delete()
        .from(User) //  req.user or req.session.id or req.session.passport.user
        .where({ id: req.session.passport.user }) //passport의 session에 있는 email 정보로 받아서 삭제하는 것으로 변경됨.
        .execute();
      console.log(`탈퇴한 회원입니다: ${req.session.passport.user}`);
      req.logout(); //탈퇴했으면 로그아웃시키고, 세션도 끊어줘야됨. 
      res.status(200).redirect('/'); //그리고 홈화면으로 API도 리다이렉트시켜야됨.
      //return res.status(200).json(delUser);
    }
  } catch (e) {
    console.error(e);
    // 에러 처리를 여기서
    return next(e);
  }

});

router.patch('', async (req, res, next) => {

});

router.post('/icon', async (req, res, next) => {

});
/**
 * 로그인(로컬)
 * req: email, password
 */
router.post('/signin', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (loginErr) => {
      try {
        if (loginErr) {
          return next(loginErr);
        }
        return res.json(user);
      } catch (e) {
        return next(e);
      }
    });
  })(req, res, next);
});

router.post('/signout', async (req, res, next) => {
  req.logout();
  if (req.session) {
    req.session.destroy((err) => {
      res.send('logout 성공');
    });
  } else {
    res.send('logout 성공');
  }
});

export default router;

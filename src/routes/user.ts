import * as express from 'express';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import * as multer from 'multer';
import * as fs from 'fs';
import { createQueryBuilder } from "typeorm";
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

/**
 * 회원정보 받아오기
 * req: req.session.passport.user
 * res: user. id, email, name, profileIconURL, isAdmin
 */
router.get('/', async (req, res, next) => {
  try {
    //일단, 사전에 세션 아이디 여부를 검증합니다.
    const user = await createQueryBuilder("user")
      .where("id = :id", { id: req.session.passport.user })
      .execute();
    //console.log(exUser); 유저가 존재하면,[]가 뜬다.
    if (user.length !== 0) {
      return res.status(200).send( //01.19 저녁 meeting. RowDataPacket 가공하여 send로 변경.
        {
          data: {
            id: user[0].User_id,
            email: user[0].User_email,
            name: user[0].User_name,
            profileIconURL: user[0].User_profileIconURL,
            isAdmin: user[0].User_isAdmin
          },
          message: "successfully got user info"
        }
      );
    }
  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };

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


      //   >>>>>>>>>>>>>>>> where절에 user.email 말고 그냥 email 쓰자!!!! <<<<<<<<<<<<<<<<<<<<<<


      .where("email = :email", { email: req.body.email })
      .execute();
    //console.log(exUser); 성공시 []가 뜬다.
    if (exUser.length !== 0) {
      console.log('이미 사용중인 아이디로 회원가입 시도 탐지');
      return res.status(403).send({ data: null, message: '이미 사용중인 아이디입니다.' });
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
    //밑의 콘솔로그는 터미널에서 회원가입정보 확인 출력용입니다.
    console.log(`회원가입 신청내역입니다 : email: ${req.body.email}, name: ${req.body.name}, password(암호화됨): ${hashedPassword}`);

    return res.status(200).send(
      {
        data: null,
        message: `signup success`
      }
    );
  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };
});

/**
 * 회원탈퇴(로컬)
 * req: req.session.passport.user
 */
router.delete('/', async (req, res, next) => {
  try {
    //일단, 사전에 삭제할 이메일이 존재하는지 확인합니다.
    const user = await createQueryBuilder("user")
      .where("id = :id", { id: req.session.passport.user })
      .execute();
    //console.log(exUser); 삭제할 이메일이 존재하면,[]가 뜬다.
    if (user.length !== 0) {
      let result: boolean = false;
      try {
        result = await bcrypt.compare(req.body.password, user[0].User_password);
      } catch (e) {
        return res.status(400).send({
          data: null,
          message: "password required"
        })
      }
      if (result) {
        await createQueryBuilder("user")
          .delete()
          .from(User) //  req.user or req.session.id or req.session.passport.user
          .where({ id: req.session.passport.user }) //passport의 session에 있는 email 정보로 받아서 삭제하는 것으로 변경됨.
          .execute();
        console.log(`탈퇴한 회원입니다: ${req.session.passport.user}`);
        req.logout(); //탈퇴했으면 로그아웃시키고, 세션도 끊어줘야됨. 
        return res.status(200).send({ data: null, message: "quit process success" });
      } else {
        return res.status(400).send({
          data: null,
          message: "wrong password"
        })
      }
    }
  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };

});

router.patch('', async (req, res, next) => {
  try {
    const user = await createQueryBuilder("user")
      .where("id = :id", { id: req.session.passport.user })
      .execute();
    if (user.length !== 0) {
      if (req.body.name && req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        await createQueryBuilder("user")
          .update(User)
          .set({ name: req.body.name, password: hashedPassword })
          .where({ id: req.session.passport.user })
          .execute();
      } else if (req.body.name) {
        await createQueryBuilder("user")
          .update(User)
          .set({ name: req.body.name })
          .where({ id: req.session.passport.user })
          .execute();
      } else if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        await createQueryBuilder("user")
          .update(User)
          .set({ password: hashedPassword })
          .where({ id: req.session.passport.user })
          .execute();
      } else return res.status(400).send({ data: null, message: "no edit info provied" });

      return res.status(200).send({ data: null, message: "edit success" });
    }
  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };

});

/**
 * icon 업로드 엔드포인트와 icon 가져오는 용 내부 API
 */
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/icon', upload.single('img'), async (req, res, next) => {

  try {
    const user = (await createQueryBuilder("user")
      .where("id = :id", { id: req.session.passport.user })
      .execute())[0];
    let oldIcon: string;
    if (user.User_profileIconURL) {
      oldIcon = user.User_profileIconURL.split('/icon/')[1];
    }
    try {
      fs.unlinkSync('./uploads/' + oldIcon);
    } catch (err) {
      console.error(err);
    }
    let profileIconURL: string = process.env.SERVER_URL + '/user/icon/' + req.file.filename;
    await createQueryBuilder("user")
      .update(User)
      .set({ profileIconURL })
      .where({ id: req.session.passport.user })
      .execute();

    return res.send({ data: { profileIconURL }, message: "set profile icon done" });

  } catch (error) {
    console.error(error.message);
    if (error.message === "Cannot read property 'user' of undefined") {
      res.status(401).send({ data: null, message: "not authorized" });
    } else {
      res.status(400).send({ data: null, message: error.message })
    }
  };

});

router.get('/icon/:id', (req, res) => { res.sendFile(req.params.id, { root: 'uploads/' }) });

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
      return res.status(401).send(info);
    }
    return req.login(user, async (loginErr) => {
      try {
        if (loginErr) {
          console.error(loginErr);
          return next(loginErr);
        }
        return res.send({ data: { id: user.User_id, email: user.User_email }, message: "login success" });
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
      res.send({ data: null, message: 'logout success' });
    });
  } else {
    res.send({ data: null, message: 'logout success' });
  }
});

export default router;

/*
  //내부 업데이트 쿼리 메소드.
  //사용법 : 일부반 바꿀 경우, 해당 input 자리에 null 값을 넣으면 됩니다.
  async function _updateQuery(User1, name1, password1, id) {
    if (name1 && password1) {
      return await createQueryBuilder("user")
        .update(User1)
        .set({ name: name1, password: password1 })
        .where({ id: id })
        .execute();
    } else if (password1 === null) {
      return await createQueryBuilder("user")
        .update(User1)
        .set({ name: name1 })
        .where({ id: id })
        .execute();
    } else if (name1 === null) {
      return await createQueryBuilder("user")
        .update(User1)
        .set({ password: password1 })
        .where({ id: id })
        .execute();
    };
  };
  */
/**
 * 회원정보 수정
 * req: name or password 또는 둘다.
 * res: message : edit success 또는 no edit info provied.
 */
/*
router.patch('/', async (req, res, next) => {
  try {
    const user = await createQueryBuilder("user")
      .where("user.id = :id", { id: req.session.passport.user })
      .execute();
    if (user.length !== 0) {
      if (req.body.name && req.body.password) {
        let hashedPassword = await bcrypt.hash(req.body.password, 12);
        _updateQuery(User, req.body.name, hashedPassword, req.session.passport.user);
      } else if (req.body.name) {
        _updateQuery(User, req.body.name, null, req.session.passport.user);
      } else if (req.body.password) {
        let hashedPassword = await bcrypt.hash(req.body.password, 12);
        _updateQuery(User, null, hashedPassword, req.session.passport.user);
      } else return res.status(400).send({ data: null, message: "no edit info provied" });
      //반환은 성공여부만.
      return res.status(200).send({ data: null, message: "edit success" });
    }
  } catch (e) {
    console.error(e);
    // 에러 처리를 여기서
    return next(e);
  }
});
*/

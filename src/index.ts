import * as express from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as expressSession from 'express-session';
import * as dotenv from 'dotenv';
import * as passport from 'passport';
import * as hpp from 'hpp';
import * as helmet from 'helmet';
import * as https from 'https';
import * as fs from 'fs';

import passportConfig from './passport';
import authRouter from './routes/auth';
import formRouter from './routes/form';
import groupRouter from './routes/group';
import historyRouter from './routes/history';
import suggestionRouter from './routes/suggestion';
import userRouter from './routes/user';

import "reflect-metadata";
// https://stackoverflow.com/questions/57762374/how-configure-typeorm-ormconfig-json-file-to-parse-entities-from-js-dist-folder
/**
 * URL 주소의 답변 참조.
 * createConnection 내부에 connection env를 잡는 대신
 * ormconfig.js로 분리하여 설정을 export 합니다.
 * ormconfig 내용은 공식문서 getting started의 connection env와 비슷하지만 
 * srcConfig의 migrations, subscribers는 미사용 상태.
 * 여기에서의 migrations도 SequelizeORM처럼 데이터베이스 스키마를 업데이트하고 기존 데이터베이스에 
 * 새로운 변경사항을 적용하기 위해 SQL 쿼리가 포함된 단일 파일입니다. - https://blog.shovelman.dev/965
 * 그러므로 현재는 src, dist 모두 entities가 핵심사용 부분.
*/
import { createConnection } from "typeorm";
createConnection();

passportConfig();
dotenv.config();
const app = express();
const prod = process.env.NODE_ENV === 'production';
app.use(cors({
    origin: 'https://yangsikdang.ml',
    //credentials(위임장) :true로 계속 위임장을 들고 있어야 CORS 제한에 걸리지 않습니다.
    //특히 axios.withCredentials ~ https.createServer에 걸쳐 필수사항.
    credentials: true,
    methods: "GET, POST, PATCH, DELETE, PUT",
    /**
     * 만일 allowedHeaders를 지정하지 않으면 기본적으로 요청의 Access-Control-Request-Headers 헤더에 지정된 헤더를 반영합니다 .
     * Authorization 요청 헤더는 서버의 사용자 에이전트임을 증명하는 자격을 포함하라는 뜻으로 필요.
     * 401 Unauthorized 관련하여 MDN에 나온 예시 중 하나. / https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Authorization
     */
    allowedHeaders: "Content-Type, Authorization",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
 * expressSession으로 session을 이용할 경우,
 * 여기서 cookie 옵션을 제대로 설정 해주어야 세션 유저 인증을 제대로 진행 할 수 있다.
 * (특히 크롬 최신 버전으로 갈수록 보안에 민감해져서 더 중요하다!)
 * 우선, client와 server의 도메인이 다를 경우, sameSite: 'none' 설정이 필수인데,
 * secure가 true가 되어야만 쿠키를 전달 할 수 있다.
 * 그리고 secure를 true로 쓰려면 https가 필수이다!
 * client와 서버의 도메인을 서로 다르게 해서 이용하려면, https 인증이 필수라 할 수 있다.
 * 현재 아래 코드는 https로 deploy 된 것을 전제로 해놓은 설정인데,
 * localhost에서 http로 테스트 할 경우, sameSite와 secure 옵션을 모두 없애고 구동하면 된다.
 */
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        path: '/',
        sameSite: 'none',
        httpOnly: false,
        secure: true
    },
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/', (req, res, next) => {
    res.send('Home');
});
app.use('/user', userRouter);
app.use('/form', formRouter);
app.use('/group', groupRouter);
app.use('/history', historyRouter);
app.use('/suggestion', suggestionRouter);
app.use('/auth', authRouter);

const port = process.env.PORT || 5000;

/* process.env의 SERVER_URL이 https://yangsikdang.ml:5000 일 때만 https로 작동하고,
 * 그 이외의 경우에는 일반 http 서버로 작동하도록 해놓았다.
 * 조금 더 스마트하게 하자면 dev, test, prod 환경을 나누어 그것으로 판별하도록 하는 방법도 있을 것인데,
 * 이번과 같은 경우는 어차피 localhost에서 http로 테스트하거나 aws에서 yangsikdang.ml 주소로 https로 배포하느냐의 2종류 뿐이기에,
 * 그 2종류만 커버하면 문제 없도록 단순하게 나누어 보았다.
 */

if (process.env.SERVER_URL === "https://yangsikdang.ml:5000") {
    const privateKey = fs.readFileSync(
        "/etc/letsencrypt/live/yangsikdang.ml/privkey.pem",
        "utf8"
    );
    const certificate = fs.readFileSync(
        "/etc/letsencrypt/live/yangsikdang.ml/cert.pem",
        "utf8"
    );
    const ca = fs.readFileSync(
        "/etc/letsencrypt/live/yangsikdang.ml/chain.pem",
        "utf8"
    );
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
    };
    const https_server = https.createServer(credentials, app);
    https_server.listen(port, () => {
        console.log(`HTTPS Server Running at ${port}`);
    });
} else {
    app.listen(port, () => {
        console.log(`Server Running at ${port}`);
    });
}

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
import { createConnection } from "typeorm";
createConnection();

passportConfig();
dotenv.config();
const app = express();
const prod = process.env.NODE_ENV === 'production';
app.use(cors({
    origin: 'https://yangsikdang.ml',
    credentials: true,
    methods: "GET, POST, PATCH, DELETE, PUT",
    allowedHeaders: "Content-Type, Authorization",
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

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

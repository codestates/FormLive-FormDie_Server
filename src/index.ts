import * as express from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import * as expressSession from 'express-session';
import * as dotenv from 'dotenv';
import * as passport from 'passport';
import * as hpp from 'hpp';
import * as helmet from 'helmet';

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
if (prod) {
    app.use(hpp());
    app.use(helmet());
    app.use(morgan('combined'));
    app.use(cors({
        origin: /yangsikdang\.ml$/,
        credentials: true,
    }));
}
else {
    app.use(morgan('dev'));
    app.use(cors({
        origin: true,
        credentials: true,
    }));
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
        domain: prod ? '.yangsikdang.ml' : undefined,
        sameSite: 'none'
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
app.listen(port, () => {
    console.log(`Server Running at ${port}`);
});

// certificate;
// const privateKey = fs.readFileSync(
//   "/etc/letsencrypt/live/yangsikdang.ml/privkey.pem",
//   "utf8"
// );
// const certificate = fs.readFileSync(
//   "/etc/letsencrypt/live/yangsikdang.ml/cert.pem",
//   "utf8"
// );
// const ca = fs.readFileSync(
//   "/etc/letsencrypt/live/yangsikdang.ml/chain.pem",
//   "utf8"
// );
// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   ca: ca,
// };
//const https_server = https.createServer(credentials, app);
// https_server.listen("8443", () => {
//   console.log(`https Server Running at 8443`);
// });

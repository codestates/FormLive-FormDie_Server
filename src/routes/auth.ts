import * as express from 'express';
import * as passport from 'passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('http://localhost:3000/home');
});

router.get('/kakao', async (req, res, next) => {

});

router.get('/kakao/callback', async (req, res, next) => {

});

router.get('/naver', async (req, res, next) => {

});

router.get('/naver/callback', async (req, res, next) => {

});

export default router;

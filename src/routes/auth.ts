import * as express from 'express';
import * as passport from 'passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.CLIENT_URL + '/home');
  });

router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: process.env.CLIENT_URL }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.CLIENT_URL + '/home');
  });

router.get('/naver', passport.authenticate('naver', { successRedirect: '/callback', failureRedirect: process.env.CLIENT_URL })

);

router.get('/naver/callback', async (req, res, next) => {
  try {
    passport.authenticate('naver', function (err, user) {

      req.logIn(user, async function (err) {
        if (err) {
          console.error(err);
          return next(err);
        }
        //console.log('naver/callback user : ', user);
        return res.redirect(process.env.CLIENT_URL);
      });
    })(req, res);

  }
  catch (e) {
    return next(e);
  }

});

export default router;

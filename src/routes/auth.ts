import * as express from 'express';
import * as passport from 'passport';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.CLIENT_URL + '/');
  });

router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: process.env.CLIENT_URL }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(process.env.CLIENT_URL + '/');
  });

/**
 * OAuth를 컨트롤러+router에서 사용법.
 * 1. authenticate를 호출하되, 로컬이 아니므로 naver에 맞추어 호출합니다.
 * 이 때 성공과 실패에 따른 리다이렉트 주소를 작성합니다.
 */
router.get('/naver', passport.authenticate('naver', { successRedirect: '/callback', failureRedirect: process.env.CLIENT_URL })

);
/**
 * 2. 성공했다면, /naver에 /callback이 붙어서 해당 콜백함수로 넘어오게 됩니다.
 * 이 때, 2번째로 authenticate를 호출하되, 메인 로직은 여기에 둡니다.
 * (원래는 success, fail, main redirect 모두 하나에 담으려 했는데 실패. try-catch-next 예외처리로 OAuth가 실패해도 무중단 proceeding. )
 * 콜백한 함수에서는 authenticate의 2번째 인자에 logIn과 비동기 주소 반환을 넣어서 마무리.
 */
router.get('/naver/callback', async (req, res, next) => {
  try {
    passport.authenticate('naver', function (err, user) {

      req.logIn(user, async function (err) {
        if (err) {
          console.error(err);
          return next(err);
        }
        //console.log('naver/callback user : ', user);
        return res.redirect(process.env.CLIENT_URL + '/');
      });
    })(req, res);

  }
  catch (e) {
    return next(e);
  }

});

export default router;

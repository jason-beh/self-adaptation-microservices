const express = require("express");
const router = express.Router();
const passport = require("passport");
const qs = require("querystring");
const Auth0Strategy = require("passport-auth0");
const Student = require("../models/Student");

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
  }
);
passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

router.get(
  "/login",
  passport.authenticate("auth0", {
    scope: "openid email profile",
  }),
  (req, res) => {
    return res.redirect("/results");
  }
);

router.get("/callback", (req, res, next) => {
  passport.authenticate("auth0", (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    if (!user) {
      return res.redirect("/auth/login");
    }

    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      // Get return address
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;

      // Save to db if it doesn't exists
      let email = user.emails[0].value;
      const student = await Student.findOne({ email }).exec();
      if (student === null) {
        const new_student = new Student({
          email: user.emails[0].value,
          nickname: user.nickname,
        });

        new_student.save(function (err) {
          if (err) {
            console.log(err);
            return res.send(err);
          }

          // Redirect to generate random subjects and scores
          return res.redirect(`/api/generate-random-courses?email=${email}`);
        });
      }

      return res.redirect(returnTo || "/results");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logOut(() => {
    let returnTo = req.protocol + "://" + req.hostname + ":3004";

    const logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);

    const searchString = qs.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo,
    });
    logoutURL.search = searchString;

    return res.redirect(logoutURL);
  });
});

module.exports = router;

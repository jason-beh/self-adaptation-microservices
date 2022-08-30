const express = require("express");
const router = express.Router();
const passport = require("passport");
const qs = require("querystring");
const Auth0Strategy = require("passport-auth0");

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    console.log(profile);
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
    res.redirect("/");
  }
);

router.get("/callback", (req, res, next) => {
  passport.authenticate("auth0", (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    console.log(user);

    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      const returnTo = req.session.returnTo;
      console.log(returnTo);
      delete req.session.returnTo;
      res.redirect(returnTo || "/");
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

    console.log(logoutURL);

    res.redirect(logoutURL);
  });
});

// passport.use(
//   new OpenIDConnectStrategy(
//     {
//       issuer: `https://${process.env["AUTH0_DOMAIN"]}`,
//       authorizationURL: `https://${process.env["AUTH0_DOMAIN"]}/authorize`,
//       tokenURL: `https://${process.env["AUTH0_DOMAIN"]}/oauth/token`,
//       userInfoURL: `https://${process.env["AUTH0_DOMAIN"]}/userinfo`,
//       clientID: process.env["AUTH0_CLIENT_ID"],
//       clientSecret: process.env["AUTH0_CLIENT_SECRET"],
//       callbackURL: "/oauth2/redirect",
//       scope: ["profile"],
//     },
//     function verify(issuer, profile, cb) {
//       console.log(profile);
//       return cb(null, profile);
//     }
//   )
// );

// passport.serializeUser(function (user, cb) {
//   process.nextTick(function () {
//     cb(null, { id: user.id, username: user.username, name: user.displayName });
//   });
// });

// passport.deserializeUser(function (user, cb) {
//   process.nextTick(function () {
//     return cb(null, user);
//   });
// });

// router.get("/login", (req, res, next) => {
//   const authenticator = passport.authenticate("openidconnect", { scope: "profile" });
//   authenticator(req, res, next);
// });

// router.get(
//   "/oauth2/redirect",
//   passport.authenticate("openidconnect", {
//     successRedirect: "/",
//     failureRedirect: "/login",
//   })
// );

// router.get("/logout", function (req, res, next) {
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     var params = {
//       client_id: process.env["AUTH0_CLIENT_ID"],
//       returnTo: "http://localhost:3004/",
//     };
//     res.redirect("https://" + process.env["AUTH0_DOMAIN"] + "/v2/logout?" + qs.stringify(params));
//   });
// });

module.exports = router;

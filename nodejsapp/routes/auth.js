const express = require("express");
const router = express.Router();
const { faker } = require("@faker-js/faker");
const passport = require("passport");
const qs = require("querystring");
const Auth0Strategy = require("passport-auth0");
const Student = require("../models/Student");
const { dbResponseTimeHistogram } = require("../utils/metrics");

// const strategy = new Auth0Strategy(
//   {
//     domain: process.env.AUTH0_DOMAIN,
//     clientID: process.env.AUTH0_CLIENT_ID,
//     clientSecret: process.env.AUTH0_CLIENT_SECRET,
//     callbackURL: process.env.AUTH0_CALLBACK_URL,
//   },
//   function (accessToken, refreshToken, extraParams, profile, done) {
//     return done(null, profile);
//   }
// );
// passport.use(strategy);

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// router.get(
//   "/login",
//   passport.authenticate("auth0", {
//     scope: "openid email profile",
//   }),
//   (req, res) => {
//     return res.redirect("/results");
//   }
// );

router.get("/login", async function (req, res, next) {
  if (typeof req.session.user === "undefined" || req.session.user == null) {
    // Get return address
    const returnTo = req.session.returnTo;
    delete req.session.returnTo;

    let email = "test@gmail.com";

    let student;

    let metrics_labels = {
      operation: "check_if_student_exists",
    };
    let timer = dbResponseTimeHistogram.startTimer();
    try {
      student = await Student.findOne({ email }).read("n").exec();
      timer({ ...metrics_labels, success: true });
    } catch (e) {
      timer({ ...metrics_labels, success: false });
      throw e;
    }

    if (student === null) {
      const new_student = new Student({
        email,
        nickname: "",
      });

      let metrics_labels = {
        operation: "create_new_student",
      };
      let timer = dbResponseTimeHistogram.startTimer();
      try {
        new_student.save(function (err) {
          if (err) {
            console.log(err);
            return res.send(err);
          }

          timer({ ...metrics_labels, success: true });

          req.session.user = {
            emails: [{ value: email }],
          };

          // Redirect to generate random subjects and scores
          return res.redirect("/api/v1/results/generate-random");
        });
      } catch (e) {
        timer({ ...metrics_labels, success: false });
        throw e;
      }
    } else {
      req.session.user = {
        emails: [{ value: email }],
      };

      return res.redirect(returnTo || "/results");
    }
  } else {
    return res.redirect("/results");
  }
});

// router.get("/callback", (req, res, next) => {
//   passport.authenticate("auth0", (err, user, info) => {
//     if (err) {
//       console.log(err);
//       return next(err);
//     }

//     if (!user) {
//       return res.redirect("/auth/login");
//     }

//     req.logIn(user, async (err) => {
//       if (err) {
//         return next(err);
//       }

//       // Get return address
//       const returnTo = req.session.returnTo;
//       delete req.session.returnTo;

//       // Save to db if it doesn't exists
//       let email = user.emails[0].value;
//       let student;

//       let metrics_labels = {
//         operation: "check_if_student_exists",
//       };
//       let timer = dbResponseTimeHistogram.startTimer();
//       try {
//         student = await Student.findOne({ email }).read('n').exec();
//         timer({ ...metrics_labels, success: true });
//       } catch (e) {
//         timer({ ...metrics_labels, success: false });
//         throw e;
//       }

//       if (student === null) {
//         const new_student = new Student({
//           email: user.emails[0].value,
//           nickname: user.nickname,
//         });

//         let metrics_labels = {
//           operation: "create_new_student",
//         };
//         let timer = dbResponseTimeHistogram.startTimer();
//         try {
//           new_student.save(function (err) {
//             if (err) {
//               console.log(err);
//               return res.send(err);
//             }

//             timer({ ...metrics_labels, success: true });

//             // Redirect to generate random subjects and scores
//             return res.redirect("/api/v1/results/generate-random");
//           });
//         } catch (e) {
//           timer({ ...metrics_labels, success: false });
//           throw e;
//         }
//       } else {
//         return res.redirect(returnTo || "/results");
//       }
//     });
//   })(req, res, next);
// });

// router.get("/logout", (req, res) => {
//   req.logOut(() => {
//     let returnTo = req.protocol + "://" + req.hostname + ":3004";

//     const logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);

//     const searchString = qs.stringify({
//       client_id: process.env.AUTH0_CLIENT_ID,
//       returnTo: returnTo,
//     });
//     logoutURL.search = searchString;

//     return res.redirect(logoutURL);
//   });
// });

router.get("/logout", (req, res) => {
  let returnTo = req.protocol + "://" + req.hostname + ":3004";

  const logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);

  const searchString = qs.stringify({
    client_id: process.env.AUTH0_CLIENT_ID,
    returnTo: returnTo,
  });
  logoutURL.search = searchString;

  delete req.session.user;

  return res.redirect(logoutURL);
});

module.exports = router;

const protected_route = (req, res, next) => {
  // console.log("protected_route: " + req.session.user);
  if (req.session.user != null) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/auth/login");
};

module.exports = protected_route;

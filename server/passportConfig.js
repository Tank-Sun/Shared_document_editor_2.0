const User = require("./databaseSchema/User");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

module.exports = function (passport) {
  passport.use(
    new localStrategy((username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) throw err;
        if (!user) {
          return done(null, false);
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      });
    })
  );
  
  const authUser = (request, accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  };
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET
  //Use "GoogleStrategy" as the Authentication Strategy
  passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/google/callback",
    passReqToCallback   : true
  }, authUser
));

// The USER object is the "authenticated user" from the done() in authUser function.
// serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session. 
  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  passport.deserializeUser((user, cb) => {
    User.findOne({ email: user.email }, (err, user) => {
      cb(err, user);
    });
  });
};

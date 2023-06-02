import User from "./dbSchema/User.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import passportLocal from "passport-local";
import passportGoogleOauth2, {VerifyFunctionWithRequest} from "passport-google-oauth2";
import {Types} from "mongoose";
import { userInfo } from "os";

const LocalStrategy = passportLocal.Strategy;
const GoogleStrategy = passportGoogleOauth2.Strategy;

declare global {
  namespace Express {
    interface User {
      _id?: number;
      username: string;
      email: string;
      password: string;
      profilePic: string;
      documents: Types.ObjectId[];
    }
  }
};

export const passportConfig = (passport: passport.PassportStatic) => {
  passport.use(
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, (username, password, done) => {
      User.findOne({ email: username }, (err: unknown, user: Express.User) => {
        if (err) throw err;
        if (!user) {
          return done(null, false);
        };
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
  
  const authUser: VerifyFunctionWithRequest = (request, accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  };
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET
  //Use "GoogleStrategy" as the Authentication Strategy
  passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID ?? "",
    clientSecret: GOOGLE_CLIENT_SECRET ?? "",
    callbackURL: "http://localhost:3001/auth/google/callback",
    passReqToCallback   : true
    }, authUser
  ));

// The USER object is the "authenticated user" from the done() in authUser function.
// serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session. 


  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  passport.deserializeUser((user:Express.User, cb) => {
    User.findOne({ email: user.email }, (err: unknown, user: Express.User) => {
      cb(err, user);
    });
  });
};
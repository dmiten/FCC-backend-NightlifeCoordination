"use strict";

import jwt from "jsonwebtoken";

import User from "./usermodel";

import { serverLog } from "./server";

const userCtrl = {};

export default userCtrl;

let generateToken = (user) => {
  return (
      jwt.sign({
        id: user.id,
        iat: Date.now(),
        exp: Date.now() + 1000 * 60 * 60 * 72
      }, process.env.JWT_SECRET)
  );
};

userCtrl.signupUser = (req, res, next) => {
  User.findOne({ email: req.body.email }, (err, user, next) => {
    if (err) {
      next(err);
    }
    if (user) {
      res.json({ message: "email already used" });
      serverLog("info", "userctrl - email already used");
    } else {
      User.create(req.body, (err, user, next) => {
        if (err) {
          next(err);
        } else {
          res.json({
            message: "new user " + user.email + "  logged in",
            userId: user.id,
            username: user.email,
            token: "JWT " + generateToken(user)
          });
          serverLog("info", "userctrl - new user " + user.email + " added");
        }
      });
    }
  });
};

userCtrl.loginUser = (req, res, next, passport) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      next(err);
    } else {
      if (!user) {
        res.json({ message: "login failed"});
        serverLog("info", "userctrl - login failed");
      } else {
        res.json({
          message: "user " + user.email + " logged in",
          userId: user.id,
          username: user.email,
          token: "JWT " + generateToken(user),
          selectedVenues: user.selectedVenues
        });
        serverLog("info", "userctrl - user " + user.email + " logged in");
      }
    }
  })(req, res, next);
};

userCtrl.logoutUser = (req, res, next, passport) => {
  passport.authenticate("jwt", (err, user) => {
    if (err) {
      next(err);
    }
    if (user) {
      req.logout();
      res.json({ message: "user " + req.body.name + " logged out" });
      serverLog("info", "userctrl - user " + req.body.name + " logged out");
    } else {
      res.status(401).json({ message: "unauthorized" });
      serverLog("info", "userctrl - unauthorized @logoutUser");
    }
  })(req, res, next);
};

userCtrl.syncUser = (req, res, next, passport) => {
  passport.authenticate("jwt", (err, user) => {
    if (err) {
      next(err);
    }
    if (user) {
      user.update({ selectedVenues: req.body.selectedVenues }, err => {
        if (!err) {
          res.json({ syncUser: "ok" });
        }
      });
    } else {
      res.status(401).json({ message: "unauthorized" });
      serverLog("info", "userctrl - unauthorized @syncUser");
    }
  })(req, res, next);
};
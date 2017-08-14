"use strict";

import userCtrl from "./userctrl";
import venueCtrl from "./venuectrl";

export default function router (app, passport) {

  app.post("/user/signup", (req, res, next) => userCtrl.signupUser(req, res, next));
  app.post("/user/login", (req, res, next) => userCtrl.loginUser(req, res, next, passport));
  app.post("/user/logout", (req, res, next) => userCtrl.logoutUser(req, res, next, passport));
  app.post("/user/sync", (req, res, next) => userCtrl.syncUser(req, res, next, passport));

  app.post("/venue/search", (req, res, next) => venueCtrl.searchVenues(req, res, next));
  app.post("/venue/get", (req, res, next) => venueCtrl.getVenue(req, res, next));
  app.post("/venue/sync", (req, res, next) => venueCtrl.syncVenue(req, res, next, passport));

}
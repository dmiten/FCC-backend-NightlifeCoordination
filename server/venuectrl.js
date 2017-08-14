"use strict";

import FoursquareVenues from "foursquarevenues";

import { serverLog } from "./server";
import Venue from "./venuemodel";

const venueCtrl = {},
      foursquare = FoursquareVenues(process.env.FOURSQUARE_CLIENT_ID,
          process.env.FOURSQUARE_CLIENT_SECRET);

export default venueCtrl;

venueCtrl.searchVenues = (req, res, next) => {

  let params = {
    limit: 50,
    venuePhotos: 1,

    // https://developer.foursquare.com/categorytree
    // 4d4b7105d754a06376d81259 - Nightlife Spot
    // 4bf58dd8d48988d116941735 - Bar

    categoryId: "4d4b7105d754a06376d81259,4bf58dd8d48988d116941735"

  };

  serverLog("info", "venueCtrl - call Foursquare API with " + req.body.type +
      "=" + req.body.position);

  if (req.body.type === "ll") {
    params.ll = req.body.position;
  } else {
    params.near = req.body.position;
  }
  params.offset = 0;

  foursquare.exploreVenues(params, (err, venues) => {
    if (err) {
      err = JSON.parse(err);
      serverLog("info", "venueCtrl - Foursquare API error: " + err.meta.errorType);
      res.json({ error: err.meta });
    } else {
      serverLog("info", "venueCtrl - transfered " + venues.response.headerFullLocation);
      res.json({ venues: venues.response.groups[0].items});
    }
  });
};

venueCtrl.getVenue = (req, res, next) => {
  Venue.findOne({ id: req.body.id }, (err, venue, next) => {
    if (err) {
      next(err);
    } else {
      if (venue) {
        res.json({ venue: venue });
        serverLog("info", "venueCtrl - founded venue id: " + venue.id);
      } else {
        res.json({ message: "no such venue in own base" });
        serverLog("info", "venueCtrl - no such venue in own base");
      }
    }
  });
};

venueCtrl.syncVenue = (req, res, next, passport) => {
  passport.authenticate("jwt", (err, user) => {
    if (err) {
      serverLog("error", err);
    }
    if (user) {
      Venue.findOneAndUpdate({ id: req.body.venue.id },
          req.body.venue,
          { upsert: true }, (err, venue) => {
            if (err) {
              serverLog("error", err);
            } else {
              res.json({ syncVenue: "ok" });
            }
          }
      );
    }
  })(req, res, next);
};
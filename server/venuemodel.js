"use strict";

import mongoose from "mongoose";

const venueSchema = new mongoose.Schema({
        id: {
          type: String,
          required: true,
          index: {unique: true}
        },
          details: {
            name: String,
            address: String,
            rating: String,
            photo: { // ◄- https://developer.foursquare.com/docs/responses/photo
              prefix: String,
              suffix: String
            },
          },
          users: [String]
        }, {
          timestamps: true
      });

export default mongoose.model("Venue", venueSchema);
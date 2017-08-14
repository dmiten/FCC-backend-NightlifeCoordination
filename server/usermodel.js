"use strict";

import crypto from "crypto";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        index: {unique: true}
      },
      passwordHash: String,
      salt: String,
      selectedVenues: [{}]
    }, {
      timestamps: true
    });

userSchema.virtual("password")
.set(function (password) {
  this._plainPassword = password;
  if (password) {
    this.salt = crypto.randomBytes(128).toString("base64");
    this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, 128, "sha1");
  } else {
    this.salt = undefined;
    this.passwordHash = undefined;
  }
})

.get(function () {
  return this._plainPassword;
});

userSchema.methods.checkPassword = function (password) {
  if (!password) return false;
  if (!this.passwordHash) return false;
  return crypto.pbkdf2Sync(password, this.salt, 1, 128, "sha1").toString() === this.passwordHash;
};

export default mongoose.model("User", userSchema);
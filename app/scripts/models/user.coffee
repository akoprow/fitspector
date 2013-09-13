'use strict';

mongoose = require 'mongoose'

root = exports ? this

Schema = mongoose.Schema

userSchema = new Schema
  id: String,
  name: String,
  isMale: Boolean,
  birthday: Date,
  smallImgUrl: String

root.User = mongoose.model 'User', userSchema

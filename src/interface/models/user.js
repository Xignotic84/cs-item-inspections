const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const userSchema = new Schema({
  id: defType,
  email: {type: String, required: true, unique: true},
  password: defType,
  created_at: Date,
  unix_created_at: Number,
})

module.exports = model('User', userSchema)
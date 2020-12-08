const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const userSchema = new Schema({
  id: {unique: true, ...defType},
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: defType,
  unix_created_at: {type: Number, required: true},
})

module.exports = model('user', userSchema)

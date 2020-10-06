const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const userSchema = new Schema({
  id: {type: String, required: true, unique: true},
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: defType,
  is_teacher: Boolean,
  unix_created_at: Number,
})

module.exports = model('user', userSchema)

const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const userSchema = new Schema({
  id: {unique: true, ...defType},
  permissionLevel: {type: Number, default: 0}, // 0 Unverified, 1 Verified normal user, 2 Manager, 3 Administrator
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  password: defType,
  verifiedNotification: {type: Boolean, default: false},
  unix_created_at: {type: Number, required: true},
})

module.exports = model('user', userSchema)

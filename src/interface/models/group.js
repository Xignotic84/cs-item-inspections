const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const groupSchema = new Schema({
  id: defType,
  owner_id: defType,
  created_at: Date,
  unix_created_at: Number,
})

module.exports = model('group', groupSchema)

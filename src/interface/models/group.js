const {Schema, model} = require('mongoose')

const defType = {type: String, required: true}

const groupSchema = new Schema({
  id: {type: String, required: true, unique: true},
  owner_id: defType,
  code: {type: String, required: true, unique: true},
  name: defType,
  description: defType,
  unix_created_at: Number,
})

module.exports = model('group', groupSchema)

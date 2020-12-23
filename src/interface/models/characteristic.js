const {Schema, model} = require('mongoose')

const defType = {type: String, required: true}

const schema = new Schema({
  id: {unique: true, ...defType},
  name: String,
  description: String,
  creator: String,
  unix_created_at: {type: Number, required: true},
})

module.exports = model('characteristic', schema)

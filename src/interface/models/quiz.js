const { Schema, model } = require('mongoose')

const defType = {type: String, required: true, unique: true}

const quizSchema = new Schema({
  id: defType,
  name: String,
  description: String,
  group_id: String,
  is_public: {type: Boolean, default: true},
  unix_created_at: Number,
})

module.exports = model('quiz', quizSchema)

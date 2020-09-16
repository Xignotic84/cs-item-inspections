const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const quizSchema = new Schema({
  id: defType,
  name: {type: String, required: true, unique: true},
  group_id: String,
  is_public: Boolean,
  created_at: Date,
  unix_created_at: Number,
})

module.exports = model('quiz', quizSchema)

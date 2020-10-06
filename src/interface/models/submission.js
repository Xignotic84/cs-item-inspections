const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const submissionSchema = new Schema({
  id: defType,
  quiz_id: defType,
  user_id: defType,
  unix_created_at: Number,
})

module.exports = model('submission', submissionSchema)

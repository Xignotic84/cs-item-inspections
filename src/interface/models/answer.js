const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const answerSchema = new Schema({
    id: defType,
    quiz_id: defType,
    user_id: defType,
    text: defType,
    unix_created_at: Number,
})

module.exports = model('answer', answerSchema)

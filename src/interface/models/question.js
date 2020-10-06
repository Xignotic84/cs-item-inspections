const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const questionSchema = new Schema({
    id: {type: String, required: true, unique: true},
    quiz_id: defType,
    text: defType,
    type: Number, // 1 = Text, 2 Image
    unix_created_at: Number
})

module.exports = model('question', questionSchema)

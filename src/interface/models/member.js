const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const memberSchema = new Schema({
    user_id: defType,
    group_id:defType,
    permissions: Number, // Out of 3, 1 = Owner, 2 = Teacher, 3 = Member
    unix_joined_at: Number,
})

module.exports = model('member', memberSchema)

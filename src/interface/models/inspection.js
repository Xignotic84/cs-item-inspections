const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const schema = new Schema({
    id: defType,
    item_id: defType,
    creator: defType,
    characteristic: defType,
    note: String,
    unix_created_at: {type: Number, required: true},
})

module.exports = model('inspection', schema)

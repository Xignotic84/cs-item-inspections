const { Schema, model } = require('mongoose')

const defType = {type: String, required: true}

const schema = new Schema({
    id: {unique: true, ...defType},
    name: defType,
    creator: defType,
    description: String,
    location: String,
    frequency: Number,
    analytics: {
        inspectedCount: {type: Number},
    },
    lastInspected: Number,
    unix_created_at: {type: Number, required: true},
})

module.exports = model('item', schema)

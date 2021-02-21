const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = new Schema({
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    password: { type: String, required: true, select: false },
    avatar_url: { type: String },
    gender: { type: String, enum: ['male', 'female'], default: 'male', required: true },
    intro: { type: String },
    locations: { type: [{ type: String }], select: false },
    industry: { type: String, select: false },
    employment: {
        type: [{
            company: { type: String },
            title: { type: String }
        }],
        select: false
    },
    education: {
        type: [{
            school: { type: String },
            major: { type: String },
            degree: { type: Number, enum: [1, 2, 3, 4, 5] },
            start_year: { type: Number },
            end_year: { type: Number }
        }],
        select: false
    },
    following: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        select: false
    }
})

module.exports = model('User', userSchema)
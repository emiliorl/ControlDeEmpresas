'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    role: String,
    username: String,
    name: String,
    password: String,
    email: String,
    phone: Number,
    companies: [{
        type: Schema.ObjectId, 
        ref: 'company'
    }]
})

module.exports = mongoose.model('user', userSchema);
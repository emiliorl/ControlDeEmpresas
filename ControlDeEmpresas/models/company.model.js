'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = Schema({
    name: String,
    username: String,
    password: String,
    email: String,
    phone: Number,
    location: String,
    employees: [{
        type: Schema.ObjectId, 
        ref: 'employee'
    }]
})

module.exports = mongoose.model('company', companySchema);
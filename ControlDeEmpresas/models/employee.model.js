'user strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeSchema = Schema({
    name: String,
    lastname: String,
    email: String,
    phone: String,
    title: String,
    department: String
});

module.exports = mongoose.model('employee', employeeSchema);
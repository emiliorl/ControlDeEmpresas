'use strict'

var express = require('express');
var bodyParser =  require('body-parser');
var userRoutes = require('./routes/user.route');
var companyRoutes = require('./routes/company.route')
var employeeRoutes = require('./routes/employee.route');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});

app.use('/api', userRoutes);
app.use('/api', companyRoutes);
app.use('/api', employeeRoutes)

module.exports = app;
'use strict'

var express = require('express');
var employeeController = require('../controllers/employee.controller');
var mdAuth = require('../middlewares/authenticatedC');

var api = express.Router();

api.put('/setEmployee/:id', mdAuth.ensureAuth,  employeeController.setEmployee);
api.put('/:idU/updateEmployee/:idC', mdAuth.ensureAuth, employeeController.updateEmployee);
api.put('/:idU/removeEmployee/:idC', mdAuth.ensureAuth, employeeController.removeEmployee);
api.get('/:id/getEmployees', mdAuth.ensureAuth, employeeController.getEmployees);
api.get('/:id/getEmployeesQuantity', mdAuth.ensureAuth, employeeController.getEmployeesQuantity);
api.post('/searchEmployee', mdAuth.ensureAuth, employeeController.searchEmployee);

module.exports = api;
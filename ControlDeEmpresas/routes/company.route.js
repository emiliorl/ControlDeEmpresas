'use strict'

var express = require('express');
var companyController = require('../controllers/company.controller');
var mdAuth = require('../middlewares/authenticated');
var mdAuthC = require('../middlewares/authenticatedC');

var api = express.Router();

api.post('/loginCompany', companyController.loginCompany);
api.put('/setCompany/:id', mdAuth.ensureAuth,  companyController.setCompany);
api.put('/:idU/updateCompany/:idC', mdAuth.ensureAuth, companyController.updateCompany);
api.put('/:idU/removeCompany/:idC', mdAuth.ensureAuth, companyController.removeCompany);
api.get('/:id/getCompanies', mdAuth.ensureAuth, companyController.getCompanies);

api.put('/:idC/createPDF', mdAuthC.ensureAuth, companyController.createPDF);
api.put('/:id/createExcel', mdAuth.ensureAuth, companyController.createExcel);

module.exports = api;
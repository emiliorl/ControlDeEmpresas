'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-IN6AM@ERC';

exports.createTokenC = (company)=>{
    var payload = {
        sub: company._id,
        name: company.name,
        company: company.email,
        iat: moment().unix(),
        exp: moment().add(4, 'hours').unix()
    }
    return jwt.encode(payload, secretKey);
}
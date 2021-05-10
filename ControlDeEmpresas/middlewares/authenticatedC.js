'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion-IN6AM@ERC';

exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La petición no lleva cabecera de autenticación'})
    }else{
        var tokenC = req.headers.authorization.replace(/['"']+/g, '');
        try{
            var payloadC = jwt.decode(tokenC, secretKey);
            if(payloadC.exp <= moment().unix()){
                return res.status(401).send({message: 'Token ha expirado'})
            }
        }catch(err){
            return res.status(404).send({message: 'Token inválido'})
        }

        req.company = payloadC;
        next();
    }
}
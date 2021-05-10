'use strict'

var mongoose = require('mongoose');
var app = require('./App')
var port = 3200;
var User = require('./models/user.model');
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/ControlEmpresas', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('El servidor de Node JS esta funcionando')
        var user = new User()
        User.findOne({username: "admin"}, (err, userFind) => {
            if(err){
                console.log('Error general' + err)          
            }else if(userFind){
                console.log('-Admin user already exists')
            }else{
                bcrypt.hash("12345", null, null, (err, passwordHash) => {
                    if(err){
                        console.log('Error en la encryptacion de la contrasena')
                    }else if(passwordHash){
                        user.role = "ROLE_ADMIN";
                        user.username = "admin";
                        user.password = passwordHash;
                        user.save((err, userSaved) => {
                            if(err){
                                console.log('Error al guardar los datos')          
                            }else if(userSaved){
                                console.log('Usuario guardado exitosamente')
                            }
                        });

                    }
                })
            }
        })
        app.listen(port, () => {
            console.log('Servidor de Express esta corriendo');
        })
    })
    .catch((err) => {
        console.log('Error al conecctar la BD', err)
    })
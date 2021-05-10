'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function login(req, res){
    var params = req.body;

    if(params.username && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la verificación de la contraseña'});
                    }else if(checkPassword){
                        if(params.gettoken){
                            return res.send({ token: jwt.createToken(userFind)});
                        }else{
                            return res.send({ message: 'Usuario logeado'});
                        }
                    }else{
                        return res.status(404).send({message: 'Contrasena incorrecta'});
                    }
                })
            }else{
                return res.send({message: 'Ususario no encontrado'});
            }
        })
    }else{
        return res.status(401).send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function saveUser(req, res){
    var user = new User();
    var params = req.body;
    
    if(params.name && params.username && params.email && params.password){
        User.findOne({username: params.username}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'});
            }else if(userFind){
                return res.send({message: 'Nombre de usuario ya en uso'});
            }else{
                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la encriptación'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.username = params.username.toLowerCase();
                        user.email = params.email.toLowerCase();

                        user.save((err, userSaved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al guardar'});
                            }else if(userSaved){
                                return res.send({message: 'Usuario guardado', userSaved});
                            }else{
                                return res.status(500).send({message: 'No se guardó el usuario'});
                            }
                        })
                    }else{
                        return res.status(401).send({message: 'Contraseña no encriptada'});
                    }
                })
            }
        })
    }else{
        return res.send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function updateUser(req, res){
    let userId = req.params.id;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(401).send({ message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.password){
            return res.status(401).send({ message: 'No se puede actualizar la contraseña desde esta función'});
        }else{
            if(update.username){
                User.findOne({username: update.username.toLowerCase()}, (err, userFind)=>{
                    if(err){
                        return res.status(500).send({ message: 'Error general'});
                    }else if(userFind){
                        return res.send({message: 'No se puede actualizar, nombre de ususario ya en uso'});
                    }else{
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(userUpdated){
                                return res.send({message: 'Usuario actualizado', userUpdated});
                            }else{
                                return res.send({message: 'No se pudo actualizar al usuario'});
                            }
                        })
                    }
                })
            }else{
                User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al actualizar'});
                    }else if(userUpdated){
                        return res.send({message: 'Usuario actualizado', userUpdated});
                    }else{
                        return res.send({message: 'No se pudo actualizar al usuario'});
                    }
                })
            }
        }
    }
    
}


function removeUser(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(403).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        User.findOne({_id: userId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al eliminar'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al verificar contraseña'});
                    }else if(checkPassword){
                        User.findByIdAndRemove(userId, (err, userRemoved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al eliminar'});
                            }else if(userRemoved){
                                return res.send({message: 'Usuario eliminado'});
                            }else{
                                return res.status(403).send({message: 'Usuario no eliminado'});
                            }
                        })
                    }else{
                        return res.status(403).send({message: 'Contraseña incorrecta, no puedes eliminar tu cuenta sin tu contraseña'});
                    }
                })
            }else{
                return res.status(403).send({message: 'Usuario no eliminado'});
            } 
        })
    }
}

function getUsers(req, res){
    User.find({}).populate('companies').exec((err, users)=>{
        if(err){
            return res.status(500).send({message: 'Error general en el servidor' + err})
        }else if(users){
            return res.send({message: 'Usuarios: ', users})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    })
}

function search(req, res){
    var params = req.body;

    if(params.search){
        User.find({$or:[{name: params.search},
                        {lastname: params.search},
                        {username: params.search}]}, (err, resultSearch)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general'});
                            }else if(resultSearch){
                                return res.send({message: 'Coincidencias encontradas: ', resultSearch});
                            }else{
                                return res.status(403).send({message: 'Búsqueda sin coincidencias'});
                            }
                        })
    }else{
        return res.status(403).send({message: 'Ingrese datos en el campo de búsqueda'});
    }
}



module.exports = {
    login,
    saveUser,
    updateUser,
    removeUser,
    getUsers,
    search
}
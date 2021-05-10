'use strict'

var Company = require('../models/company.model');
var Employee = require('../models/employee.model');

function setEmployee(req, res){
    var companyId = req.params.id;
    var params = req.body;
    var employee = new Employee();

    if(params.name && params.lastname && params.title && params.department){
        if(companyId != req.company.sub){
            return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
        }else{
            Company.findById(companyId, (err, companyFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'})
                }else if(companyFind){
                    employee.name = params.name;
                    employee.lastname = params.lastname;
                    employee.email = params.email.toLowerCase();
                    employee.phone = params.phone;
                    employee.title = params.title;
                    employee.department = params.department;
    
                    employee.save((err, employeeSaved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al guardar'})
                        }else if(employeeSaved){
                            Company.findByIdAndUpdate(companyId, {$push:{employees: employeeSaved._id}}, {new: true}, (err, employeePush)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al agergar empleado'})
                                }else if(employeePush){
                                    return res.send({message: 'Empleado agregado', employeePush});
                                }else{
                                    return res.status(500).send({message: 'Error al agregar empleado'})
                                }
                            })
                        }else{
                            return res.status(404).send({message: 'No se guardó al empleado'})
                        }
                    })
                }else{
                    return res.status(404).send({message: 'La empresa a la que deseas agregar el empleadp no existe.'})
                }
            })
        }
    }else{
        return res.status(401).send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function updateEmployee(req, res){
    let companyId = req.params.idU;
    let employeeId = req.params.idC;
    let update = req.body;

    if(companyId != req.company.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.name && update.phone){
            Employee.findById(employeeId, (err, employeeFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al buscar'});
                }else if(employeeFind){
                    Company.findOne({_id: companyId, employees: employeeId}, (err, companyFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en la busqueda de empresa'});
                        }else if(companyFind){
                            Employee.findByIdAndUpdate(employeeId, update, {new: true}, (err, employeeUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general en la actualización'});
                                }else if(employeeUpdated){
                                    return res.send({message: 'Empleado actualizado', employeeUpdated});
                                }else{
                                    return res.status(404).send({message: 'Empleado no actualizado'});
                                }
                            })
                        }else{
                            return res.status(404).send({message: 'Empresa no encontrada'})
                        }
                    })
                }else{
                    return res.status(404).send({message: 'No existe el empleado a actulizar'});
                }
            })
        }else{
            return res.status(404).send({message: 'Por favor ingresa los datos mínimos para actualizar'});
        }
    }
}

function removeEmployee(req, res){
    let companyId = req.params.idU;
    let employeeId = req.params.idC;

    if(companyId != req.company.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Company.findOneAndUpdate({_id: companyId, employees: employeeId},
            {$pull:{employees: employeeId}}, {new:true}, (err, employeePull)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'});
                }else if(employeePull){
                    Employee.findByIdAndRemove(employeeId, (err, employeeRemoved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al eliminar empleado'});
                        }else if(employeeRemoved){
                            return res.send({message: 'Empleado eliminado', employeePull});
                        }else{
                            return res.status(500).send({message: 'Empleado no encontrado, o ya eliminada'});
                        }
                    })
                }else{
                    return res.status(500).send({message: 'No se pudo eliminar el empleado de la empresa'});
                }
            }).populate('employees')
    }
}

function getEmployees(req, res){
    let companyId = req.params.id;

    if(companyId != req.company.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Company.findOne({_id: companyId}).populate("employees").exec((err, companies)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(companies){
                return res.send({message: 'Empleados: ', employees: companies.employees})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

function getEmployeesQuantity(req, res){
    let companyId = req.params.id;

    if(companyId != req.company.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        Company.findOne({_id: companyId}).populate("employees").exec((err, companies)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor' + err})
            }else if(companies){
                return res.send({message: `Hay ${companies.employees.length} empleados en ${companies.name}`,
                                    employees: companies.employees})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

/* function searchEmployee(req, res){
    var params = req.body;

    if(params.search){
        Employee.find({$or:[{_id: params.search},
                        {name: params.search},
                        {lastname: params.search},
                        {email: params.search},
                        {phone: params.search},
                        {title: params.search},
                        {department: params.search}]}, (err, resultSearch)=>{
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
} */

function searchEmployee(req, res){
    var params = req.body;

    if(params.search){
        Employee.findById({_id: params.search},(err, resultSearch) =>{
            if(resultSearch){
                return res.send({message: 'Coincidencias encontradas: ', resultSearch});
            }else{
                Employee.find({$or:[
                    {name: params.search},
                    {lastname: params.search},
                    {email: params.search},
                    {phone: params.search},
                    {title: params.search},
                    {department: params.search}]}, (err, resultSearch)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general' + err});
                        }else if(resultSearch){

                            return res.send({message: 'Coincidencias encontradas: ', resultSearch});
                        }else{
                            return res.status(403).send({message: 'Búsqueda sin coincidencias'});
                        }
                    })
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese datos en el campo de búsqueda'});
    }
}

module.exports = {
    setEmployee,
    updateEmployee,
    getEmployees,
    removeEmployee,
    searchEmployee,
    getEmployeesQuantity
}
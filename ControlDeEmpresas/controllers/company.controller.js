'use strict'

var User = require('../models/user.model');
var Company = require('../models/company.model');
var bcrypt = require('bcrypt-nodejs');
var jwtC = require('../services/jwtC');
var fs = require("fs");
var pdfKit = require("pdfkit");
const PDFDocument = require('./pdfkit-tables');
const doc = new PDFDocument({layout: 'landscape'});
var mongoXlsx = require('mongo-xlsx');
const excel = require('exceljs');

function loginCompany(req, res){
    var params = req.body;

    if(params.username && params.password){
        Company.findOne({username: params.username.toLowerCase()}, (err, companyFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(companyFind){
                bcrypt.compare(params.password, companyFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la verificación de la contraseña'});
                    }else if(checkPassword){
                        if(params.gettokenC){
                            return res.send({ token: jwtC.createTokenC(companyFind)});
                        }else{
                            return res.send({ message: 'Empresa logeada'});
                        }
                    }else{
                        return res.status(404).send({message: 'Contrasena incorrecta'});
                    }
                })
            }else{
                return res.send({message: 'Empresa no encontrada'});
            }
        })
    }else{
        return res.status(401).send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function setCompany(req, res){
    var userId = req.params.id;
    var params = req.body;
    var company = new Company();

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        if(params.name && params.username && params.phone && params.email && params.password){
            User.findById(userId, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'})
                }else if(userFind){
                    Company.findOne({username: params.username.toLowerCase()}, (err, companyFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en el servidor'});
                        }else if(companyFind){
                            return res.send({message: 'Nombre de usuario ya en uso'});
                        }else{
                            bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general en la encriptación'});
                                }else if(passwordHash){
                                    company.password = passwordHash;
                                    company.name = params.name;
                                    company.username = params.username.toLowerCase();
                                    company.email =params.email.toLowerCase();
                                    company.phone = params.phone;
                                    company.location = params.location;
            
                                    company.save((err, companySaved)=>{
                                        if(err){
                                            return res.status(500).send({message: 'Error general al guardar'})
                                        }else if(companySaved){
                                            User.findByIdAndUpdate(userId, {$push:{companies: companySaved._id}}, {new: true}, (err, companyPush)=>{
                                                if(err){
                                                    return res.status(500).send({message: 'Error general al agergar empresa'})
                                                }else if(companyPush){
                                                    return res.send({message: 'Empresa agregada', companyPush});
                                                }else{
                                                    return res.status(500).send({message: 'Error al agregar empresa'})
                                                }
                                            })
                                        }else{
                                            return res.status(404).send({message: 'No se guardó la empresa'})
                                        }
                                    })
                                }else{
                                    return res.status(401).send({message: 'Contraseña no encriptada'});
                                }
                            })
                        }
                    })
                }else{
                    return res.status(404).send({message: 'El usuario al que deseas agregar la empresa no existe.'})
                }
            })
        }else{
            return res.send({message: 'Por favor ingresa los datos obligatorios'});
        }
    }
}

function updateCompany(req, res){
    let userId = req.params.idU;
    let companyId = req.params.idC;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.password){
            return res.status(401).send({ message: 'No se puede actualizar la contraseña desde esta función'});
        }else{
            if(update.name && update.phone){
                Company.findById(companyId, (err, companyFind)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al buscar'});
                    }else if(companyFind){
                        User.findOne({_id: userId, companies: companyId}, (err, userFind)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general en la busqueda de usuario'});
                            }else if(userFind){
                                Company.findByIdAndUpdate(companyId, update, {new: true}, (err, companyUpdated)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error general en la actualización'});
                                    }else if(companyUpdated){
                                        return res.send({message: 'Empresa actualizada', companyUpdated});
                                    }else{
                                        return res.status(404).send({message: 'Empresa no actualizada'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message: 'Usuario no encontrado'})
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'No existe la empresa a actulizar'});
                    }
                })
            }else{
                return res.status(404).send({message: 'Por favor ingresa los datos mínimos para actualizar'});
            }
        }
    }
}

function removeCompany(req, res){
    let userId = req.params.idU;
    let companyId = req.params.idC;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        User.findOneAndUpdate({_id: userId, companies: companyId},
            {$pull:{companies: companyId}}, {new:true}, (err, companyPull)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'});
                }else if(companyPull){
                    Company.findByIdAndRemove(companyId, (err, companyRemoved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al eliminar empresa'});
                        }else if(companyRemoved){
                            return res.send({message: 'Empresa eliminada', companyPull});
                        }else{
                            return res.status(500).send({message: 'Empresa no encontrada, o ya eliminada'});
                        }
                    })
                }else{
                    return res.status(500).send({message: 'No se pudo eliminar la empresa del usuario'});
                }
            }).populate('companies')
    }
}

function getCompanies(req, res){
    let userId = req.params.id;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        User.findOne({_id: userId}).populate('companies').exec((err, users)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'})
            }else if(users){
                return res.send({message: 'Empresas: ', companies: users.companies})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}



/* function createPDF(req,res){
    let companyId = req.params.idC;
    var infoEmployees = []

    if(companyId != req.company.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        Company.findOne({_id: companyId}).populate("employees").exec((err, company)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'})
            }else{
                var pdfName = company.name.replace(/[' ']/g, '_')+".pdf";
                pdfdocument.pipe(fs.createWriteStream(`./data/pdf/${pdfName}`))
                pdfdocument.text(company.name,{align: 'center'})
                pdfdocument.moveDown;
                var employees = company.employees;
                pdfdocument.text('Id  | Name | Lastname | Phone | Email | Title | Departament',{align: 'center'})
                employees.map(employee => {
                    var employeeId = employee._id
                    var name = employee.name
                    var lastname = employee.lastname
                    var phone = employee.phone
                    var email = employee.email
                    var title = employee.title
                    var department = employee.department
                    if(employeeId === undefined || employeeId === null) employeeId = 'N/A' 
                    if(name === undefined || name === null) name = 'N/A'
                    if(lastname === undefined || lastname === null) lastname = 'N/A'
                    if(phone === undefined || phone === null) phone = 'N/A'
                    if(email === undefined || email === null) email = 'N/A'
                    if(title === undefined || title === null) title = 'N/A'
                    if(department === undefined || department === null) department = 'N/A'
                    pdfdocument.text(`${employeeId} ${name} ${lastname} ${phone} ${email} ${title} ${department}`,{align: 'center'})
                    pdfdocument.moveDown;
                })
                pdfdocument.end();
                return res.send({message: 'PDF created'})
            }
        })
    }
} */

function createPDF(req,res){
    let companyId = req.params.idC;

    if(companyId != req.company.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        Company.findOne({_id: companyId}).populate("employees").exec((err, company)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'})
            }else{
                var pdfName = company.name.replace(/[' ']/g, '_')+`_Employees-${company._id}.pdf`;
                var employees = company.employees;
                var employeeInfo = []
                employees.map(employee => {
                    
                    employeeInfo.push([/* employee._id, */employee.name,employee.lastname,employee.phone,employee.email/* ,employee.title */,employee.department]);
                    if(employee.id == employees[employees.length - 1].id){
                        const table0 = {
                            headers: [/* 'Id',  */'Name', 'Lastname', 'Phone', 'Email'/* , 'Title' */, 'Departament'],
                            rows: employeeInfo
                        };
                        doc.pipe(fs.createWriteStream(`./data/pdf/${pdfName}`))
                        doc.text().font('Helvetica-Bold')
                        doc.text(company.name,{align: 'center'}).font('Helvetica')
                        if(company.location === null || company.location === undefined){
                            doc.text('+502('+company.phone+') - '+company.email,{align: 'center'})
                        }else{
                            doc.text(company.location+' - '+'+502('+company.phone+') - '+company.email,{align: 'center'}).font('Helvetica')
                        }
                        doc.moveDown(1);
                        doc.table(table0, {
                            prepareHeader: () => doc.font('Helvetica-Bold'),
                            prepareRow: (row, i) => doc.font('Helvetica').fontSize(12)
                        });
                        doc.end();
                    }
                })
                return res.send({message: 'PDF created'})
            }
        })
    }
}

/* function createExcel(req,res){
    let userId = req.params.id;
    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        User.findOne({_id: userId}).populate('companies').exec((err, users)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'})
            }else if(users){
                users.companies.map(company => {
                    Company.findOne({_id: company.id}).populate("employees").exec((err, companyE)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en el servidor'})
                        }else{
                            var data = companyE.employees;
                            var model = mongoXlsx.buildDynamicModel(data);
                            
                            mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
                                console.log(`File saved at: ${data.fullPath}`); 
                            });
                        }
                    })
                })
                return res.send({msg: "Archivos creados exitosamente"})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
} */

function createExcel(req,res){
    let userId = req.params.id;
    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        User.findOne({_id: userId}).populate('companies').exec((err, users)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'})
            }else if(users){
                users.companies.map(company => {
                    Company.findOne({_id: company.id}).populate("employees").exec((err, companyE)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en el servidor'})
                        }else{
                            
                            var data = companyE.employees;
                            var excelName = company.name.replace(/[' ']/g, '_')+`_EmployeesDetails-${company._id}.xlsx`;

                            let workbook = new excel.Workbook(); 
                            let worksheet = workbook.addWorksheet(`Employees`);
                            
                            worksheet.columns = [
                                { header: 'Id', key: '_id', width: 30 },
                                { header: 'Name', key: 'name', width: 20 },
                                { header: 'Lastname', key: 'lastname', width: 20 },
                                { header: 'Email', key: 'email', width: 40 },
                                { header: 'Phone', key: 'phone', width: 12 },
                                { header: 'Title', key: 'title', width: 30 },
                                { header: 'Department', key: 'department', width: 30 }
                            ];

                            worksheet.addRows(data);

                            
                            
                            workbook.xlsx.writeFile(`./data/excel/${excelName}`)

                        }
                    })
                })
                return res.send({msg: "Archivos creados exitosamente"})
            }else{
                return res.status(404).send({message: 'No hay registros'})
            }
        })
    }
}

module.exports = {
    loginCompany,
    setCompany,
    updateCompany,
    getCompanies,
    removeCompany,
    createPDF,
    createExcel
}
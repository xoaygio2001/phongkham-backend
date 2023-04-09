const db = require("../models");

let createSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name
                || !data.imageBase64
                || !data.descriptionHTML
                || !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })

                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        }
        catch (e) {
            reject(e)
        }
    })
}

let getAllSpecialty = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll({

            });
            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }

            resolve({
                errMessage: 'ok',
                errCode: 0,
                data
            })
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailSpecialtyById = (inputId, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId || !location) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            }
            else {
                let data = await db.Specialty.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: ['descriptionHTML', 'descriptionMarkdown', 'id', 'name']
                })

                if (data) {
                    let doctorSpecialty = [];
                    if (location === 'All') {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: { specialtyId: inputId },
                            attributes: ['doctorId', 'provinceId']
                        })
                    } else {
                        // find by location
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: {
                                specialtyId: inputId,
                                provinceId: location
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    }

                    data.doctorSpecialty = doctorSpecialty;
                } else data = {};

                resolve({
                    errMessage: 'ok',
                    errCode: 0,
                    data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}



let EditSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.id
                || !data.name
                || !data.descriptionHTML
                || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {

                let specialtyInfor = await db.Specialty.findOne({
                    where: {
                        id: data.id,
                    },
                    raw: false
                })
                if (specialtyInfor) {
                    specialtyInfor.name = data.name;
                    specialtyInfor.descriptionHTML = data.descriptionHTML;
                    specialtyInfor.descriptionMarkdown = data.descriptionMarkdown;
                    if (data.imageBase64) {
                        specialtyInfor.image = data.imageBase64;
                    }
                    await specialtyInfor.save();

                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: 'Ko luu dc'
                    })
                }
            }
        }
        catch (e) {
            reject(e)
        }
    })
}


let DeleteSpecialty = (specialtyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let specialty = await db.Specialty.findOne({
                where: { id: specialtyId },
                raw: false
            })
            if (!specialty) {
                resolve({
                    errCode: 2,
                    message: `The specialty isn't exist!`
                })
            }

            else {
                await specialty.destroy();

                resolve({
                    errCode: 0,
                    message: "The specialty is deleted"
                })
            }
        } catch (e) {
            reject(e)
        }

    })
}

module.exports = {
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    EditSpecialty: EditSpecialty,
    DeleteSpecialty: DeleteSpecialty
}
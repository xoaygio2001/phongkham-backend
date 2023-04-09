const db = require('../models');

let createClinic = (data) => {
    return new Promise(async (resolve, reject) => {

        try {
            if (!data.name || !data.address
                || !data.imageBase64
                || !data.descriptionHTML
                || !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })

                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }

        } catch (e) {
            reject(e)
        }
    })
}

let getAllClinic = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll({

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

let getDetailClinicById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            }
            else {
                let data = await db.Clinic.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: ['id', 'name', 'address', 'descriptionHTML', 'descriptionMarkdown']
                })

                if (data) {
                    let doctorClinic = [];
                    doctorClinic = await db.Doctor_Infor.findAll({
                        where: { clinicId: inputId },
                        attributes: ['doctorId', 'provinceId']
                    })
                    data.doctorClinic = doctorClinic;
                } else data = {}

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

let EditClinic = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.id
                || !data.name
                || !data.descriptionHTML
                || !data.descriptionMarkdown
                || !data.address) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {

                let clinicInfor = await db.Clinic.findOne({
                    where: {
                        id: data.id,
                    },
                    raw: false
                })
                if (clinicInfor) {
                    clinicInfor.name = data.name;
                    clinicInfor.descriptionHTML = data.descriptionHTML;
                    clinicInfor.descriptionMarkdown = data.descriptionMarkdown;
                    clinicInfor.address = data.address;
                    if (data.imageBase64) {
                        clinicInfor.image = data.imageBase64;
                    }
                    await clinicInfor.save();

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


let DeleteClinic = (clinicId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let clinic = await db.Clinic.findOne({
                where: { id: clinicId },
                raw: false
            })
            if (!clinic) {
                resolve({
                    errCode: 2,
                    message: `The clinic isn't exist!`
                })
            }

            else {
                await clinic.destroy();

                resolve({
                    errCode: 0,
                    message: "The clinic is deleted"
                })
            }
        } catch (e) {
            reject(e)
        }

    })
}

module.exports = {
    createClinic: createClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById,
    EditClinic: EditClinic,
    DeleteClinic: DeleteClinic
}
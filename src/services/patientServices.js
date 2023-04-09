import db from "../models/index";
require('dotenv').config();
import emailService from './emailService';
import { v4 as uuidv4 } from 'uuid';

let buildUrlEmail = (doctorId, token, type) => {
    let result = ''
    if (type == 'create') {
        result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`
    } else {
        result = `${process.env.URL_REACT}/delete-booking?token=${token}&doctorId=${doctorId}`
    }

    return result;
}

let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.email || !data.doctorId || !data.timeType || !data.date
                || !data.fullName || !data.selectedGender
                || !data.address
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {

                //upsert patient

                let userTemp = await db.User.findOne({
                    where: { email: data.email },
                });

                if (userTemp && userTemp.warning >= 3) {
                    resolve({
                        errCode: 3,
                        errMessage: 'Bạn đã bị ban khỏi hệ thống, do bạn vắng quá nhiều trong buổi hẹn'
                    })
                } else {

                    let user = await db.User.findOrCreate({
                        where: { email: data.email },
                        defaults: {
                            email: data.email,
                            roleId: 'R3',
                            gender: data.selectedGender,
                            address: data.address,
                            firstName: data.fullName
                        },
                    });

                    if (user && user[0]) {


                        let userTemp = await db.Booking.findOne({
                            where: { patientId: user[0].id, date: data.date, doctorId: data.doctorId, timeType: data.timeType }
                        })

                        if (userTemp) {
                            resolve({
                                errCode: 2,
                                errMessage: 'Tạo thất bại, bạn đã tạo lịch thời này với bác sĩ này rồi!'
                            })
                        } else {
                            let token = uuidv4();
                            await emailService.sendSimpleEmail({
                                reciverEmail: data.email,
                                patientName: data.fullName,
                                time: data.timeString,
                                doctorName: data.doctorName,
                                language: data.language,
                                redirectLink: buildUrlEmail(data.doctorId, token, 'create'),
                                deleteLink: buildUrlEmail(data.doctorId, token, 'cancel')
                            })

                            //create a booking record
                            if (user && user[0]) {
                                let STTtemp = await db.Booking.findAll({
                                    where: { date: data.date, doctorId: data.doctorId, timeType: data.timeType }
                                })

                                var typeSTT = '';

                                switch (data.timeType) {
                                    case 'T1':
                                        typeSTT = 'A'
                                        break;
                                    case 'T2':
                                        typeSTT = 'B'
                                        break;
                                    case 'T3':
                                        typeSTT = 'C'
                                        break;
                                    case 'T4':
                                        typeSTT = 'D'
                                        break;
                                    case 'T5':
                                        typeSTT = 'E'
                                        break;
                                    case 'T6':
                                        typeSTT = 'F'
                                        break;
                                    case 'T7':
                                        typeSTT = 'G'
                                        break;
                                    case 'T8':
                                        typeSTT = 'H'
                                        break;
                                }

                                if (STTtemp && STTtemp.length > 0) {
                                    await db.Booking.create({
                                        statusId: 'S1',
                                        doctorId: data.doctorId,
                                        patientId: user[0].id,
                                        date: data.date,
                                        timeType: data.timeType,
                                        token: token,
                                        STT: typeSTT + (STTtemp.length + 1)
                                    })
                                } else {
                                    await db.Booking.create({
                                        statusId: 'S1',
                                        doctorId: data.doctorId,
                                        patientId: user[0].id,
                                        date: data.date,
                                        timeType: data.timeType,
                                        token: token,
                                        STT: typeSTT + 1
                                    })
                                }


                            }

                            resolve({
                                errCode: 0,
                                errMessage: 'Save infor patient succeed!'
                            })
                        }

                    }
                }

            }
        }
        catch (e) {
            reject(e);
        }
    })
}

let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false
                })

                if (appointment) {
                    appointment.statusId = 'S2';
                    await appointment.save();

                    resolve({
                        errCode: 0,
                        errMessage: "Update the appoinmet succeed!",
                        STT: appointment.STT
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appointment has been activated or does not exist"
                    })
                }
            }
        }
        catch (e) {
            reject(e);
        }
    })
}

let postDeleteSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token
                    },
                    raw: false
                })

                if (appointment) {
                    appointment.statusId = 'Canceled';
                    await appointment.save();

                    resolve({
                        errCode: 0,
                        errMessage: "Update the appoinmet succeed!",
                        STT: appointment.STT
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appointment has been activated or does not exist"
                    })
                }
            }
        }
        catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment,
    postDeleteSchedule: postDeleteSchedule
}
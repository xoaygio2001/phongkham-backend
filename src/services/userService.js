import e from "express";
import db from "../models/index";
import bcrypt from 'bcryptjs';
import { raw } from "body-parser";

const salt = bcrypt.genSaltSync(10);

// Handling

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId == 'All') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }

                });
            }
            if (userId && userId !== 'All') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                });
            }
            resolve(users);
        }
        catch (except) {
            reject(except);
        }
    });
}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExit = await checkUserEmail(email);
            if (isExit) {
                let user = await db.User.findOne({
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName'],
                    where: { email: email }
                });
                if (user && user.password && user.roleId) {
                    let check = await bcrypt.compareSync(password, user.password);
                    if (check) {
                        delete user.password;
                        userData.errCode = 0;
                        userData.errMessage = 'OK';
                        userData.user = user;
                    }
                    else {
                        userData.errCode = 3;
                        userData.errMessage = "Wrong password~";
                    }
                }
                else {
                    userData.errCode = 2;
                    userData.errMessage = "User's not found!";
                }
            }
            else {
                userData.errCode = 1;
                userData.errMessage = "You's Email isn't exist in system!";

            }
            resolve(userData);
        }
        catch (except) {
            reject(except);
        }
    })
}

let CreateNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkEmail = await checkUserEmail(data.email);

            if (checkEmail === true) {
                resolve({
                    errCode: 2,
                    errMessage: 'Email is already exist!'
                })
            }

            if (!checkEmail) {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password)

                // data.avatar = new Buffer(data.avatar, 'base64').toString('binary');

                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar
                });

                resolve({
                    errCode: 0,
                    message: 'Oke'
                })
            }


        }
        catch (expcept) {
            reject(expcept);
        }
    })
}

let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters'
                })
            }

            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            });

            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber
                if (data.avatar) {
                    user.image = data.avatar
                }

                await user.save();

                resolve({
                    errCode: 0,
                    message: 'Update the user success!'
                })
            }
            else {
                resolve({
                    errCode: 2,
                    errMessage: "User's not found!"
                })
            }
        }
        catch (expcept) {
            reject(expcept);
        }
    })
}

let DeleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: { id: userId },
            raw: false
        })
        if (!user) {
            resolve({
                errCode: 2,
                message: `The user isn't exist!`
            })
        }

        if (user) {
            await user.destroy();

            resolve({
                errCode: 0,
                message: "The user is deleted"
            })
        }

    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                });
            }
            else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }
        }
        catch (e) {
            reject(e);
        }
    })
}

// Support Function

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })

            if (user) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        }
        catch (except) {
            reject(except);
        }
    })
}

let hashUserPassword = (userPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(userPassword, salt);
            resolve(hashPassword);
        }
        catch (expcept) {
            reject(expcept);
        }
    })
}



module.exports = {
    getAllUsers: getAllUsers,
    handleUserLogin: handleUserLogin,
    CreateNewUser: CreateNewUser,
    updateUserData: updateUserData,
    DeleteUser: DeleteUser,
    getAllCodeService: getAllCodeService

}
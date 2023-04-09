import db from '../models/index';
import userService from "../services/userService";

let handleGetAllUsers = async (req, res) => {
    let id = req.query.id;

    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Missing required parameters",
            users: users
        })
    }

    let users = await userService.getAllUsers(id);
    return res.status(200).json({
        errCode: 0,
        errMessage: "OK",
        users: users
    })
}

let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter!'
        });
    }

    let userData = await userService.handleUserLogin(email, password);

    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    });
}

let handleCreateNewUser = async (req, res) => {
    let data = req.body;

    // if (!data.email || !data.password || !data.firstName || !data.lastName ||
    //     !data.address || !data.phoneNumber || !data.gender || !data.roleId) {
    //     return res.status(200).json({
    //         errCode: 1,
    //         message: 'Missing Parameters!'
    //     });
    // }

    if (!data.email || !data.password || !data.firstName ||
        !data.lastName || !data.address) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing Parameters!'
        });
    }

    let message = await userService.CreateNewUser(data);
    return res.status(200).json(message);
}

let handleEditUser = async (req, res) => {
    let data = req.body.data
    if (!data.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Id not exist!'
        })
    }
    let message = await userService.updateUserData(data);
    return res.status(200).json(message);
}

let handleDeleteUser = async (req, res) => {
    let id = req.body.id;
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: 'Missing Parameters!'
        });
    }

    let message = await userService.DeleteUser(id);
    return res.status(200).json(message);
}

let getAllCode = async (req, res) => {
    try {
        let data = await userService.getAllCodeService(req.query.type);
        return res.status(200).json(data);
    }
    catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from Server"
        })
    }
}

module.exports = {
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewUser: handleCreateNewUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    getAllCode: getAllCode
};
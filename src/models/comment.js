'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Comment.belongsTo(models.User, { foreignKey: 'patientId', targetKey: 'id', as: 'userData' })

            Comment.belongsTo(models.Booking, { foreignKey: 'patientId', targetKey: 'patientId', as: 'patientData' })

            Comment.belongsTo(models.Booking, { foreignKey: 'doctorId', targetKey: 'doctorId', as: 'doctorData' })

        }
    };
    Comment.init({
        patientId: DataTypes.INTEGER,
        doctorId: DataTypes.INTEGER,
        content: DataTypes.STRING,

    }, {
        sequelize,
        modelName: 'Comment',
    });
    return Comment;
};
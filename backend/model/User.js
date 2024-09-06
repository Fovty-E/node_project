const { DataTypes, Model} = require('sequelize');
const { sequelize } = require('./');


class User extends Model {}
User.init({
    firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      roles: {
        type: DataTypes.JSONB,
        defaultValue: {
          User: 2001,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      verified: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      refreshToken: {
        type: DataTypes.STRING,
      },
}, {
    sequelize,
    modelName: 'User',
    timestamps: true
});

  
    module.exports =  User;

  
// 'use strict';
// module.exports = function(sequelize, DataTypes) {
//   var User = sequelize.define('User', {
//     email: DataTypes.STRING,
//     password: DataTypes.STRING,
//     roleId: DataTypes.INTEGER
//   }, {
//     classMethods: {
//       associate: function(models) {
//         // associations can be defined here
//       }
//     }
//   });
//   return User;
// };

const Role = require('../models').Role;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });
  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      onDelete: 'CASCADE',
    });
    User.hasMany(models.Document, {
      foreignKey: 'userId',
      as: 'documents',
    });
  };
  return User;
};

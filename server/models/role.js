// 'use strict';
// module.exports = function(sequelize, DataTypes) {
//   var Role = sequelize.define('Role', {
//     role: DataTypes.STRING
//   }, {
//     classMethods: {
//       associate: function(models) {
//         // associations can be defined here
//       }
//     }
//   });
//   return Role;
// };

const User = require('../models').User;

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'roleId',
      as: 'users',
    });
  };
  return Role;
};

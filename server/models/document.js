// 'use strict';
// module.exports = function(sequelize, DataTypes) {
//   var Document = sequelize.define('Document', {
//     title: DataTypes.STRING,
//     content: DataTypes.TEXT,
//     access: DataTypes.ENUM,
//     userId: DataTypes.INTEGER
//   }, {
//     classMethods: {
//       associate: function(models) {
//         // associations can be defined here
//       }
//     }
//   });
//   return Document;
// };

const User = require('../models').User;

module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    access: {
      type: DataTypes.ENUM('Public', 'Private', 'Role'),
      defaultValue: 'Public',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });
  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
  };
  return Document;
};

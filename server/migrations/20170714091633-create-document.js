// 'use strict';
// module.exports = {
//   up: function(queryInterface, Sequelize) {
//     return queryInterface.createTable('Documents', {
// id: {
//   allowNull: false,
//   autoIncrement: true,
//   primaryKey: true,
//   type: Sequelize.INTEGER
// },
// title: {
//   type: Sequelize.SRING
// },
// content: {
//   type: Sequelize.TEXT
// },
// access: {
//   type: Sequelize.ENUM
// },
// userId: {
//   type: Sequelize.INTEGER
// },
// createdAt: {
//   allowNull: false,
//   type: Sequelize.DATE
// },
// updatedAt: {
//   allowNull: false,
//   type: Sequelize.DATE
// }
//     });
//   },
//   down: function(queryInterface, Sequelize) {
//     return queryInterface.dropTable('Documents');
//   }
// };

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      content: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      access: {
        type: Sequelize.ENUM('Public', 'Private', 'Role'),
        defaultValue: 'Public'
      },
      userId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: 'id',
          as: 'userId',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }),
  down: queryInterface => queryInterface.dropTable('Documents'),
};


const dotenv = require('dotenv'),
  bcrypt = require('bcrypt');

dotenv.config();

const saltRounds = 10;

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', [{
    email: process.env.EMAIL,
    password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
    roleId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }], {}),

  down: queryInterface => queryInterface.bulkDelete('Users', null, {})
};

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Roles', [{
    role: 'Super Admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }, {
    role: 'Admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }, {
    role: 'User',
    createdAt: new Date(),
    updatedAt: new Date()
  }], {}),

  down: queryInterface => queryInterface.bulkDelete('Roles', null, {})
};

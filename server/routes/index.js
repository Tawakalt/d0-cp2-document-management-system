const rolesController = require('../controllers').roles;
const usersController = require('../controllers').users;

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Document management System\'s API!',
  }));

  // Endpoints for roles
  app.post('/api/roles', rolesController.create);
  app.get('/api/roles', rolesController.list);

  // Endpoints for users
  app.post('/users/:roleId', usersController.create);
  app.post('/users', usersController.create);
};

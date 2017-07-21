// const rolesController = require('../controllers').roles;
// const usersController = require('../controllers').users;

import rolesController from '../controllers/roles';
import usersController from '../controllers/users';

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Document management System\'s API!',
  }));

  // Endpoints for roles
  app.post('/roles', rolesController.create);
  app.get('/roles', rolesController.list);

  // Endpoints for users
  app.post('/users/:roleId', usersController.create);
  app.post('/users', usersController.create);

  app.get('/users', usersController.list);
};

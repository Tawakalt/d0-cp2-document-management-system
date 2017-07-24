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
  app.post('/users/login', usersController.login);
  app.post('/users/:roleId', usersController.create);
  app.post('/users', usersController.create);

  app.get('/users/logout', usersController.logout);
  app.get('/users', usersController.list);
  app.get('/users/:userId', usersController.retrieve);

  app.put('/users/:userId', usersController.update);

  app.delete('/users/:userId', usersController.destroy);
};

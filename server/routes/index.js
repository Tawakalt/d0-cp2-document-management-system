import rolesController from '../controllers/roles';
import usersController from '../controllers/users';
import Utils from '../../utils';

module.exports = (app) => {
  app.get('/api/v1', (req, res) => res.status(200).send({
    message: 'Welcome to the Document management System\'s API!',
  }));

  // Endpoints for roles
  app.post('/api/v1/roles',
    Utils.isLoggedIn, Utils.isSuper, rolesController.create);
  app.get('/api/v1/roles',
    Utils.isLoggedIn, Utils.isAdmin, rolesController.list);

  // Endpoints for users
  app.post('/api/v1/users/login', Utils.isValid, usersController.login);
  app.post('/api/v1/users', usersController.create);

  app.get('/api/v1/users/logout', Utils.isLoggedIn, usersController.logout);
  app.get('/api/v1/users',
    Utils.isLoggedIn, Utils.isAdmin, usersController.list);
  app.get('/api/v1/users/:userId',
    Utils.isLoggedIn, Utils.isAdmin, usersController.retrieve);

  app.put('/api/v1/users/:userId', Utils.isLoggedIn, usersController.update);

  app.delete('/api/v1/users/:userId',
    Utils.isLoggedIn, Utils.isSuper, usersController.destroy);
};

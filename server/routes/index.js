import rolesController from '../controllers/roles';
import usersController from '../controllers/users';
import documentsController from '../controllers/documents';
import Utils from '../../utils';
import utils from '../../logic/documentsLogic';

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
  app.post('/api/v1/users', Utils.isValid, usersController.create);

  app.get('/api/v1/users/logout', Utils.isLoggedIn, usersController.logout);
  app.get('/api/v1/users',
    Utils.isLoggedIn, Utils.isAdmin, usersController.list);
  app.get('/api/v1/users/:userId',
    Utils.isLoggedIn, Utils.isAdmin, usersController.retrieve);

  app.put('/api/v1/users/:userId', Utils.isLoggedIn, usersController.update);

  app.delete('/api/v1/users/:userId',
    Utils.isLoggedIn, Utils.isSuper, usersController.destroy);

  // Endpoints for documents
  app.post('/api/v1/documents',
    Utils.isLoggedIn, utils.isValid, documentsController.create);

  app.get('/api/v1/documents',
    Utils.isLoggedIn, documentsController.list);
  app.get('/api/v1/documents/:docId',
    Utils.isLoggedIn, documentsController.retrieve);

  app.put('/api/v1/documents/:docId',
    Utils.isLoggedIn, documentsController.update);

  app.delete('/api/v1/documents/:docId',
    Utils.isLoggedIn, documentsController.destroy);
};

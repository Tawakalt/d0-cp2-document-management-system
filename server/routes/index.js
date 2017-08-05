import rolesController from '../controllers/roles';
import usersController from '../controllers/users';
import documentsController from '../controllers/documents';
import searchController from '../controllers/search';
import Middleware from '../middleware/middleware';

const Route = (app) => {
  // Endpoints for roles
  app.post('/api/v1/roles',
    Middleware.authenticate, Middleware.isSuperAdmin, rolesController.create);
  app.get('/api/v1/roles',
    Middleware.authenticate, Middleware.isAdmin, rolesController.list);

  // Endpoints for users
  app.post('/api/v1/users/login',
    Middleware.isUserValid, usersController.login);
  app.post('/api/v1/users', Middleware.isUserValid, usersController.create);

  app.get('/api/v1/users/logout',
    Middleware.authenticate, usersController.logout);
  app.get('/api/v1/users',
    Middleware.authenticate, Middleware.isAdmin, usersController.list);
  app.get('/api/v1/users/:userId',
    Middleware.authenticate, Middleware.isAdmin, usersController.retrieve);
  app.get('/api/v1/users/:userId/documents',
    Middleware.authenticate, Middleware.isAdmin, usersController.allUsersDoc);

  app.put('/api/v1/users/:userId',
    Middleware.authenticate, usersController.update);

  app.delete('/api/v1/users/:userId',
    Middleware.authenticate, Middleware.isSuperAdmin, usersController.destroy);

  // Endpoints for documents
  app.post('/api/v1/documents', Middleware.authenticate,
    Middleware.isDocumentValid, documentsController.create);

  app.get('/api/v1/documents',
    Middleware.authenticate, documentsController.list);
  app.get('/api/v1/documents/:docId',
    Middleware.authenticate, documentsController.retrieve);

  app.put('/api/v1/documents/:docId',
    Middleware.authenticate, documentsController.update);

  app.delete('/api/v1/documents/:docId',
    Middleware.authenticate, documentsController.destroy);

  // Endpoints for Search
  app.get('/api/v1/search/users',
    Middleware.authenticate, Middleware.isAdmin, searchController.userSearch);

  app.get('/api/v1/search/documents',
    Middleware.authenticate, searchController.docSearch);
};
export default Route;

import RolesController from '../controllers/RolesController';
import UsersController from '../controllers/UsersController';
import DocumentsController from '../controllers/DocumentsController';
import SearchController from '../controllers/SearchController';
import Middleware from '../middleware/Middleware';

const Route = (app) => {
  // Endpoints for roles
  app.post('/api/v1/roles',
    Middleware.authenticate, Middleware.isSuperAdmin, RolesController.create);
  app.get('/api/v1/roles',
    Middleware.authenticate, Middleware.isAdmin, RolesController.list);

  // Endpoints for users
  app.post('/api/v1/users/login',
    Middleware.isUserValid, UsersController.login);
  app.post('/api/v1/users', Middleware.isUserValid, UsersController.create);

  app.get('/api/v1/users/logout',
    Middleware.authenticate, UsersController.logout);
  app.get('/api/v1/users',
    Middleware.authenticate, Middleware.isAdmin, UsersController.list);
  app.get('/api/v1/users/:userId',
    Middleware.authenticate, Middleware.isAdmin, UsersController.retrieve);
  app.get('/api/v1/users/:userId/documents',
    Middleware.authenticate, Middleware.isAdmin, UsersController.allUsersDoc);

  app.put('/api/v1/users/:userId',
    Middleware.authenticate, UsersController.update);

  app.delete('/api/v1/users/:userId',
    Middleware.authenticate, Middleware.isSuperAdmin, UsersController.destroy);

  // Endpoints for documents
  app.post('/api/v1/documents', Middleware.authenticate,
    Middleware.isDocumentValid, DocumentsController.create);

  app.get('/api/v1/documents',
    Middleware.authenticate, DocumentsController.list);
  app.get('/api/v1/documents/:documentId',
    Middleware.authenticate, DocumentsController.retrieve);

  app.put('/api/v1/documents/:documentId',
    Middleware.authenticate, DocumentsController.update);

  app.delete('/api/v1/documents/:documentId',
    Middleware.authenticate, DocumentsController.destroy);

  // Endpoints for Search
  app.get('/api/v1/search/users',
    Middleware.authenticate, Middleware.isAdmin, SearchController.userSearch);

  app.get('/api/v1/search/documents',
    Middleware.authenticate, SearchController.docSearch);
};
export default Route;

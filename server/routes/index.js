const rolesController = require('../controllers').roles;

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the Document management System\'s API!',
  }));

  app.post('/api/roles', rolesController.create);

  app.get('/api/roles', rolesController.list);
};

const Role = require('../models').Role;

module.exports = {
  create(req, res) {
    return Role
      .create({
        role: req.body.role,
      })
      .then(role => res.status(201).send(role))
      .catch(error => res.status(400).send(error));
  },
  list(req, res) {
    return Role
      .all()
      .then(role => res.status(200).send(role))
      .catch(error => res.status(400).send(error));
  },
};

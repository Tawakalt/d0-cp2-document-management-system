const Role = require('../models').Role;

export default class rolesController {
  static create(req, res) {
    return Role
      .create({
        role: req.body.role,
      })
      .then(res.status(201).send({
        message: 'Role successfully created' }))
      .catch(error => res.status(400).send(error));
  }

  static list(req, res) {
    return Role
      .all()
      .then(role => res.status(200).send(role))
      .catch(error => res.status(400).send(error));
  }
}

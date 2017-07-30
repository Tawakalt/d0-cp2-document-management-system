const Role = require('../models').Role;
const User = require('../models').User;

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
      .findAll({
        include: [{
          model: User,
          as: 'users',
        }],
        order: [
          ['id', 'ASC']
        ]
      })
      .then(role => res.status(200).send(role))
      .catch(error => res.status(400).send(error.toString()));
  }
}

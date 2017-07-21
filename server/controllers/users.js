import bcrypt from 'bcrypt';
import validator from 'validator';

const User = require('../models').User;
const Role = require('../models').Role;

const saltRounds = 10;

export default class usersController {
  static create(req, res) {
    if (validator.isEmail(req.body.email) === false) {
      return res.status(404).send({
        message: 'Invalid Email',
      });
    }
    return User
      .find({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        if (user) {
          return res.status(404).send({
            message: 'Email already exists',
          });
        }
        let roleId;
        if (req.params.roleId) {
          roleId = req.params.roleId;
        } else {
          roleId = 3;
        }
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
          return User
            .create({
              email: req.body.email,
              password: hash,
              roleId,
            })
            .then(res.status(201).send({
              message: 'User successfully created' }))
            .catch(error => res.status(400).send(error.toString()));
        });
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static list(req, res) {
    return User
      .findAll({
        include: [
          { model: Role }
        ],
        order: [
          ['id', 'DESC']
        ]
      })
      .then((user) => {
        res.status(200).send(user);
      });
  }
}

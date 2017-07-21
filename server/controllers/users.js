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

  static retrieve(req, res) {
    return User
      .findById(req.params.userId, {
        include: [{
          model: Role,
        }],
      })
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }
        return res.status(200).send(user);
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static update(req, res) {
    return User
      .findById(req.params.userId, {
        include: [{
          model: Role,
        }],
      })
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }
        if (req.body.roleId) {
          return res.status(404).send({
            message: 'Common stop it!!! You can\'t change your role',
          });
        }
        if (validator.isEmail(req.body.email) === false) {
          return res.status(404).send({
            message: 'Invalid Email',
          });
        }
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
          let message = '';
          if (req.body.email === user.email) {
            message += 'Email up to date. ';
          } else {
            message += 'Email successfully Updated. ';
          }
          bcrypt.compare(req.body.password, user.password, (err, resp) => {
            if (resp === true) {
              message += 'Password up to date. ';
            } else {
              message += 'Password successfully Updated. ';
            }
            return user
              .update({
                email: req.body.email || user.email,
                password: hash || user.password,
              })
              .then(() => res.status(200).send({ message }))
              .catch(error => res.status(400).send(error.toString()));
          });
        });
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static destroy(req, res) {
    return User
      .findById(req.params.userId)
      .then((user) => {
        if (!user) {
          return res.status(400).send({
            message: 'User Not Found',
          });
        }
        return user
          .destroy()
          .then(() => res.status(400).send({
            message: 'User successfully deleted' }))
          .catch(error => res.status(400).send(error.toString()));
      })
      .catch(error => res.status(400).send(error.toString()));
  }
}

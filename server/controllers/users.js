import bcrypt from 'bcrypt';
import validator from 'validator';
import ls from 'local-storage';
import jwt from '../../jwt';

require('dotenv').config();


const User = require('../models').User;
const Role = require('../models').Role;

const saltRounds = 10;

export default class usersController {
  static create(req, res) {
    if (validator.isEmpty(req.body.email) === true) {
      return res.status(404).send({
        message: 'Email is Required',
      });
    }
    if (validator.isEmpty(req.body.password) === true) {
      return res.status(404).send({
        message: 'Password is Required',
      });
    }
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
    const property = {
      include: [
        { model: Role }
      ],
      order: [
        ['id', 'DESC']
      ]
    };
    if (req.query.limit && req.query.offset) {
      property.limit = req.query.limit;
      property.offset = req.query.offset;
    }
    return User
      .findAll(property)
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
        if (validator.isEmpty(req.body.email) === true) {
          return res.status(404).send({
            message: 'Email is Required',
          });
        }
        if (validator.isEmpty(req.body.password) === true) {
          return res.status(404).send({
            message: 'Password is Required',
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

  static login(req, res) {
    if (validator.isEmpty(req.body.email) === true) {
      return res.status(404).send({
        message: 'Email is Required',
      });
    }
    if (validator.isEmpty(req.body.password) === true) {
      return res.status(404).send({
        message: 'Password is Required',
      });
    }
    if (validator.isEmail(req.body.email) === false) {
      return res.status(404).send({
        message: 'Invalid Email',
      });
    }
    return User
      .findAll({
        where: {
          email: req.body.email
        }
      })
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'Kindly signup first',
          });
        }
        bcrypt.compare(
          req.body.password, user[0].dataValues.password, (err, resp) => {
            if (resp === false) {
              return res.status(404).send({
                message: 'Wrong Password',
              });
            }
            const token = jwt.sign(
              user[0].dataValues.id,
              user[0].dataValues.email,
              user[0].dataValues.roleId
            );
            ls.set('token', token);
            return res.status(200).send({
              message: 'login successful' });
          });
      })
      .catch(error => res.status(400).send(error.toString()));
  }
}

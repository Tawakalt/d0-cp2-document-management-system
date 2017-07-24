import bcrypt from 'bcrypt';
import validator from 'validator';
import localStorage from 'local-storage';
import jwt from 'jsonwebtoken';
import jwtoken from '../../jwt';

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
      .findOne({
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
    if (!localStorage.get('token')) {
      return res.status(404).send({
        message: 'You are not signed in',
      });
    }
    jwt.verify(
      localStorage.get('token'),
      process.env.JWT_SECRET,
      (error, loggedInUser) => {
        if (loggedInUser.roleId === 3) {
          return res.status(404).send({
            message: 'You do not have access to this request!!!',
          });
        }
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
          .then((users) => {
            res.status(200).send(users);
          });
      });
  }

  static retrieve(req, res) {
    if (!localStorage.get('token')) {
      return res.status(404).send({
        message: 'You are not signed in',
      });
    }
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
        jwt.verify(
          localStorage.get('token'),
          process.env.JWT_SECRET,
          (error, loggedInUser) => {
            if (loggedInUser.roleId === 3) {
              return res.status(404).send({
                message: 'You do not have access to this request!!!',
              });
            }
            return res.status(200).send(user);
          });
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static update(req, res) {
    if (!localStorage.get('token')) {
      return res.status(404).send({
        message: 'You are not signed in',
      });
    }
    return User
      .findById(req.params.userId)
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }
        jwt.verify(
          localStorage.get('token'),
          process.env.JWT_SECRET,
          (error, loggedInUser) => {
            if (loggedInUser.roleId !== 1 &&
              loggedInUser.id !== parseInt(req.params.userId)) {
              return res.status(404).send({
                message: 'You cannot update someone else\'s details',
              });
            }
            if ((loggedInUser.roleId !== 1 && req.body.roleId) ||
            (loggedInUser.id === parseInt(req.params.userId) &&
            req.body.roleId !== undefined)) {
              return res.status(404).send({
                message: 'Common stop it!!! You can\'t change your role',
              });
            }
            if (loggedInUser.roleId === 1 &&
              loggedInUser.id !== parseInt(req.params.userId) &&
              (req.body.email || req.body.password)) {
              let msg = 'You only have acess to change a user\'s role, ';
              msg += 'not their email and definitely not their password!!!';
              return res.status(404).send({
                message: msg,
              });
            }
            if (req.body.email === '' ||
              (req.body.email && validator.isEmpty(req.body.email) === true)) {
              return res.status(404).send({
                message: 'Email is Required!!!',
              });
            }
            if (req.body.password === '' ||
              (req.body.password &&
                validator.isEmpty(req.body.password) === true)) {
              return res.status(404).send({
                message: 'Password is Required!!!',
              });
            }
            if (req.body.email &&
              validator.isEmail(req.body.email) === false) {
              return res.status(404).send({
                message: 'Invalid Email!!!',
              });
            }
            bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
              let message = '';
              if (req.body.email !== undefined) {
                if (req.body.email === user.email) {
                  message += 'Email up to date. ';
                } else {
                  message += 'Email successfully Updated. ';
                }
              }
              bcrypt.compare(
                req.body.password, user.password, (err, resp) => {
                  if (req.body.email !== undefined) {
                    if (resp === true) {
                      message += 'Password up to date. ';
                    } else {
                      message += 'Password successfully Updated. ';
                    }
                  }
                  if (req.body.roleId &&
                    validator.isNumeric(req.body.roleId) === false) {
                    return res.status(404).send({
                      message: 'Invalid RoleId!!!',
                    });
                  }
                  if (req.body.roleId) {
                    if (parseInt(req.body.roleId) === user.roleId) {
                      message += 'Role up to date. ';
                    } else {
                      message += 'Role successfully Updated. ';
                    }
                  }
                  return user
                    .update({
                      email: req.body.email || user.email,
                      password: hash || user.password,
                      roleId: req.body.roleId || user.roleId
                    })
                    .then(() => res.status(200).send({ message }))
                    .catch((err) => {
                      let SeqError = 'SequelizeForeignKeyConstraintError: ';
                      SeqError += 'insert or update on table "Users" violates ';
                      SeqError += 'foreign key constraint "Users_roleId_fkey"';
                      if (err.toString() === SeqError) {
                        return res.status(404).send({
                          message: 'There is no role with that RoleId!!!',
                        });
                      }
                      if (err.toString() ===
                        'SequelizeUniqueConstraintError: Validation error') {
                        return res.status(404).send({
                          message: 'Your Edited Email already exists!!!',
                        });
                      }
                      res.status(400).send(err.toString());
                    });
                });
            });
          });
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static destroy(req, res) {
    if (!localStorage.get('token')) {
      return res.status(404).send({
        message: 'You are not signed in',
      });
    }
    return User
      .findById(req.params.userId)
      .then((user) => {
        if (!user) {
          return res.status(400).send({
            message: 'User Not Found',
          });
        }
        jwt.verify(
          localStorage.get('token'),
          process.env.JWT_SECRET,
          (error, loggedInUser) => {
            if (loggedInUser.roleId === 2 || loggedInUser.roleId === 3) {
              return res.status(404).send({
                message: 'You do not have access to this request!!!',
              });
            }
            return user
              .destroy()
              .then(() => res.status(400).send({
                message: 'User successfully deleted' }))
              .catch(err => res.status(400).send(err.toString()));
          });
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
      .find({
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
          req.body.password, user.dataValues.password, (err, resp) => {
            if (resp === false) {
              return res.status(404).send({
                message: 'Wrong Password',
              });
            }
            const token = jwtoken.sign(
              user.dataValues.id,
              user.dataValues.email,
              user.dataValues.roleId
            );
            localStorage.set('token', token);
            return res.status(200).send({
              message: 'login successful' });
          });
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static logout(req, res) {
    if (!localStorage.get('token')) {
      return res.status(404).send({
        message: 'You are not signed in',
      });
    }
    localStorage.clear();
    return res.status(404).send({
      message: 'User sussefully logged out',
    });
  }
}

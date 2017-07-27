import bcrypt from 'bcrypt';
import localStorage from 'local-storage';
import jwt from 'jsonwebtoken';
import jwtoken from '../jwt';
import Utils from '../utils';

require('dotenv').config();


const User = require('../models').User;
const Role = require('../models').Role;
const Document = require('../models').Document;

const saltRounds = 10;

export default class usersController {
  static create(req, res) {
    return User
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        if (!Utils.doesEmailExist(req, res, user)) {
          bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            return User
              .create({
                email: req.body.email,
                password: hash,
                roleId: 3,
              })
              .then(res.status(201).send({
                message: 'User successfully created' }))
              .catch(error => res.status(400).send(error.toString()));
          });
        }
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
      .then((users) => {
        res.status(200).send(users);
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
        if (!Utils.isUser(req, res, user)) {
          return res.status(200).send(user);
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static update(req, res) {
    return User
      .findById(req.params.userId)
      .then((user) => {
        if (!Utils.isUser(req, res, user)) {
          jwt.verify(
            localStorage.get('token'),
            process.env.JWT_SECRET,
            (error, loggedInUser) => {
              if (!Utils.allowUpdate(
                req, res, loggedInUser, parseInt(req.params.userId), req.body)
              ) {
                if (!Utils.isValidParams(
                  req, res, req.body.email, req.body.password)) {
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
                        if (!Utils.isRoleValid(req, res, req.body.roleId)) {
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
                              if (!Utils.checkError(req, res, err)) {
                                res.status(400).send(err.toString());
                              }
                            });
                        }
                      });
                  });
                }
              }
            });
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static destroy(req, res) {
    return User
      .findById(req.params.userId)
      .then((user) => {
        if (!Utils.isUser(req, res, user)) {
          return user
            .destroy()
            .then(() => res.status(400).send({
              message: 'User successfully deleted' }))
            .catch(err => res.status(400).send(err.toString()));
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static login(req, res) {
    return User
      .find({
        where: {
          email: req.body.email
        }
      })
      .then((user) => {
        if (!Utils.isUser(req, res, user)) {
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
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  static logout(req, res) {
    localStorage.clear();
    return res.status(404).send({
      message: 'User sussefully logged out',
    });
  }

  static allUsersDoc(req, res) {
    return Document
      .findAll({
        where: { userId: req.params.userId },
        order: [
          ['id', 'DESC']
        ]
      })
      .then((doc) => {
        if (doc.length === 0) {
          res.status(201).send(
            { message: 'This User has not created any Document' });
        } else {
          res.status(200).send(doc);
        }
      });
  }
}

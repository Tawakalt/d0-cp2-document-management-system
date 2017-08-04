import bcrypt from 'bcrypt';
import jwtoken from '../helper/jwt';
import Utils from '../helper/utils';
import utils from '../helper/documentsLogic';

require('dotenv').config();

const User = require('../models').User;
const Document = require('../models').Document;

const saltRounds = 10;

/**
 * @description Contains all Users Related Functions
 * @export
 * @class usersController
 */
export default class usersController {
  /**
   * @description Allows Users to signup
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
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
              .then(createdUser => res.status(201).send(createdUser))
              .catch(error => res.status(500).send(error.toString()));
          });
        }
      })
      .catch(error => res.status(500).send(error.toString()));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to View all Users
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static list(req, res) {
    const property = {
      order: [
        ['id', 'DESC']
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'password']
      },
    };
    if (!utils.listQuery(
      req, res, req.query.limit, req.query.offset, property)) {
      return User
        .findAll(res.property)
        .then((users) => {
          const totalCount = users.length;
          let pageCount = Math.round(totalCount / (req.query.limit || 10));
          pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
          const page = Math.round((req.query.offset || 0) /
          (req.query.limit || 10)) + 1;
          if (users.length === 0) {
            res.status(200).send({ message: 'No User Found' });
          }
          res.status(200).send({ users,
            metaData: {
              page,
              pageCount,
              count: users.length,
              totalCount,
            }
          });
        });
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Get a specific User
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static retrieve(req, res) {
    return User
      .findById(req.params.userId, {
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password']
        },
      })
      .then((user) => {
        if (!Utils.isUser(req, res, user)) {
          return res.status(200).send(user);
        }
      })
      .catch(error => res.status(500).send(error.toString()));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Update a User
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static update(req, res) {
    return User
      .findById(req.params.userId)
      .then((user) => {
        if (!Utils.isUser(req, res, user)) {
          if (!Utils.allowUpdate(
            req, res, parseInt(req.params.userId), req.body)
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
                        .then(updatedDetails => res.status(200).send(
                          { updatedDetails, message }))
                        .catch((err) => {
                          if (!Utils.checkError(req, res, err)) {
                            res.status(500).send(err.toString());
                          }
                        });
                    }
                  });
              });
            }
          }
        }
      })
      .catch(error => res.status(500).send(error.toString()));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Delete a User
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static destroy(req, res) {
    return User
      .findById(req.params.userId)
      .then((user) => {
        if (!Utils.isUser(req, res, user)) {
          if (!Utils.allowDelete(req, res, parseInt(req.params.userId))) {
            return user
              .destroy()
              .then(() => res.status(200).send({
                message: 'User successfully deleted' }))
              .catch(err => res.status(500).send(err.toString()));
          }
        }
      })
      .catch(error => res.status(500).send(error.toString()));
  }

  /**
   * @description Allows Registered Users to login
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static login(req, res) {
    return User
      .find({
        where: {
          email: req.body.email
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
      })
      .then((user) => {
        if (!Utils.isUser(req, res, user)) {
          bcrypt.compare(
            req.body.password, user.dataValues.password, (err, resp) => {
              if (resp === false) {
                return res.status(400).send({
                  message: 'Wrong Password',
                });
              }
              const token = jwtoken.sign(
                user.dataValues.id,
                user.dataValues.email,
                user.dataValues.roleId
              );
              delete user.dataValues.password;
              return res.status(200).send({
                message: 'login successful', user, token });
            });
        }
      })
      .catch(error => res.status(500).send(error.toString()));
  }

  /**
   * @description Allows Resgistered and Loggedin Users to Logout
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static logout(req, res) {
    return res.status(200).send({
      message: 'User sussefully logged out',
    });
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to View All Documents of a Registered User
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static allUsersDoc(req, res) {
    return Document
      .findAll({
        where: { userId: req.params.userId },
        order: [
          ['id', 'DESC']
        ],
        attributes: {
          exclude: ['updatedAt']
        }
      })
      .then((doc) => {
        if (doc.length === 0) {
          res.status(200).send(
            { message: 'This User has not created any Document' });
        } else {
          res.status(200).send(doc);
        }
      });
  }
}

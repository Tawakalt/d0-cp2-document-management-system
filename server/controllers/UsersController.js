import bcrypt from 'bcrypt';
import jwtoken from '../helper/jwt';
import Utils from '../helper/Utils';
import DocumentsLogic from '../helper/DocumentsLogic';

require('dotenv').config();

const User = require('../models').User;
const Document = require('../models').Document;

const saltRounds = 10;

/**
 * @description Contains all Users Related Functions
 * @export
 * @class usersController
 */
export default class UsersController {
  /**
   * @description Allows Users to signup
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static create(request, response) {
    return User
      .findOne({
        where: {
          email: request.body.email,
        },
      })
      .then((user) => {
        if (Utils.allowEmail(request, response, user)) {
          bcrypt.hash(request.body.password, saltRounds, (err, hash) => {
            return User
              .create({
                email: request.body.email,
                password: hash,
                roleId: 3,
              })
              .then((createdUser) => {
                delete createdUser.dataValues.password;
                response.status(201).send(createdUser);
              })
              .catch(error => response.status(500).send(error.toString()));
          });
        }
      })
      .catch(error => response.status(500).send(error.toString()));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to View all Users
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static list(request, response) {
    const property = {
      order: [
        ['id', 'DESC']
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'password']
      },
    };
    if (DocumentsLogic.listQuery(
      request, response, request.query.limit, request.query.offset, property)) {
      return User
        .findAll(response.property)
        .then((users) => {
          if (users.length === 0) {
            return response.status(200).send({ message: 'No User Found' });
          }
          DocumentsLogic.paginate(request, response, users);
        });
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Get a specific User
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static retrieve(request, response) {
    if (Utils.userIdValid(request, response, request.params.userId)) {
      return User
        .findById(request.params.userId, {
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'password']
          },
        })
        .then((user) => {
          if (Utils.isUser(request, response, user)) {
            return response.status(200).send(user);
          }
        })
        .catch(error => response.status(500).send(error.toString()));
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Update a User
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static update(request, response) {
    if (Utils.userIdValid(request, response, request.params.userId)) {
      return User
        .findById(request.params.userId)
        .then((user) => {
          if (Utils.isUser(request, response, user)) {
            if (Utils.allowUpdate(
              request, response, parseInt(request.params.userId), request.body)
            ) {
              if (Utils.isValidParams(
                request, response, request.body.email, request.body.password)) {
                bcrypt.hash(request.body.password, saltRounds, (err, hash) => {
                  let message = '';
                  if (request.body.email !== undefined) {
                    if (request.body.email === user.email) {
                      message += 'Email up to date. ';
                    } else {
                      message += 'Email successfully Updated. ';
                    }
                  }
                  bcrypt.compare(
                    request.body.password, user.password, (err, resp) => {
                      if (request.body.email !== undefined) {
                        if (resp === true) {
                          message += 'Password up to date. ';
                        } else {
                          message += 'Password successfully Updated. ';
                        }
                      }
                      if (Utils.isRoleValid(
                        request, response, request.body.roleId)) {
                        if (request.body.roleId) {
                          if (parseInt(request.body.roleId) === user.roleId) {
                            message += 'Role up to date. ';
                          } else {
                            message += 'Role successfully Updated. ';
                          }
                        }
                        return user
                          .update({
                            email: request.body.email || user.email,
                            password: hash || user.password,
                            roleId: request.body.roleId || user.roleId
                          })
                          .then((updatedDetails) => {
                            delete updatedDetails.dataValues.password;
                            response.status(200).send(
                              { updatedDetails, message });
                          })
                          .catch((err) => {
                            if (!Utils.validationError(
                              request, response, err)) {
                              response.status(500).send(err.toString());
                            }
                          });
                      }
                    });
                });
              }
            }
          }
        })
        .catch(error => response.status(500).send(error.toString()));
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Delete a User
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static destroy(request, response) {
    if (Utils.userIdValid(request, response, request.params.userId)) {
      return User
        .findById(request.params.userId)
        .then((user) => {
          if (Utils.isUser(request, response, user)) {
            if (Utils.allowDelete(request, response,
              parseInt(request.params.userId))) {
              return user
                .destroy()
                .then(() => response.status(200).send({
                  message: 'User successfully deleted' }))
                .catch(err => response.status(500).send(err.toString()));
            }
          }
        })
        .catch(error => response.status(500).send(error.toString()));
    }
  }

  /**
   * @description Allows Registered Users to login
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static login(request, response) {
    return User
      .find({
        where: {
          email: request.body.email
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
      })
      .then((user) => {
        if (Utils.isUser(request, response, user)) {
          bcrypt.compare(
            request.body.password, user.dataValues.password, (err, resp) => {
              if (resp === false) {
                return response.status(400).send({
                  message: 'Wrong Password',
                });
              }
              const token = jwtoken.sign(
                user.dataValues.id,
                user.dataValues.email,
                user.dataValues.roleId
              );
              delete user.dataValues.password;
              return response.status(200).send({
                message: 'login successful', user, token });
            });
        }
      })
      .catch(error => response.status(500).send(error.toString()));
  }

  /**
   * @description Allows Registered and Loggedin Users to Logout
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static logout(request, response) {
    return response.status(200).send({
      message: 'User sussefully logged out',
    });
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to View All Documents of a Registered User
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof usersController
   */
  static allUsersDoc(request, response) {
    if (Utils.userIdValid(request, response, request.params.userId)) {
      return Document
        .findAll({
          where: { userId: request.params.userId },
          order: [
            ['id', 'DESC']
          ],
          attributes: {
            exclude: ['updatedAt']
          }
        })
        .then((doc) => {
          if (doc.length === 0) {
            response.status(200).send(
              { message: 'This User has not created any Document' });
          } else {
            response.status(200).send(doc);
          }
        });
    }
  }
}

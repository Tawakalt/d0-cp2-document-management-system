import validator from 'validator';
import jwt from 'jsonwebtoken';

require('dotenv').config();

/**
 * @description Contains Authentication middleware and User Related Logic
 * @export
 * @class Utils
 */
export default class Middleware {
  /**
   * @description Checks if User is Loggedin
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} false
   * @memberof Utils
   */
  static authenticate(request, response, next) {
    if (!request.headers.authorization) {
      response.status(401).send({
        message: 'You are not signed in',
      });
      return false;
    }
    const token = request.headers.authorization;
    request.token = token;
    request.loggedInUser = jwt.verify(request.token,
      process.env.JWT_SECRET);
    next();
  }

  /**
   * @description Checks if User is an Admin
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} false
   * @memberof Utils
   */
  static isAdmin(request, response, next) {
    if (request.loggedInUser.roleId === 3) {
      response.status(403).send({
        message: 'You do not have access to this request!!!',
      });
      return false;
    }
    next();
  }

  /**
   * @description Checks if User is a Super Admin
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} false
   * @memberof Utils
   */
  static isSuperAdmin(request, response, next) {
    if (request.loggedInUser.roleId !== 1) {
      response.status(403).send({
        message: 'You do not have access to this request!!!',
      });
      return false;
    }
    if (request.loggedInUser.roleId === 1) {
      request.admin = true;
    }
    next();
  }

  /**
   * @description Validates User parameters
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} false
   * @memberof Utils
   */
  static isUserValid(request, response, next) {
    if (!request.body.email && validator.isEmpty(request.body.email)) {
      response.status(400).send({
        message: 'Email is Required',
      });
      return false;
    }
    if (!request.body.password && validator.isEmpty(request.body.password)) {
      response.status(400).send({
        message: 'Password is Required',
      });
      return false;
    }
    if (request.body.email && !(validator.isEmail(request.body.email))) {
      response.status(400).send({
        message: 'Invalid Email',
      });
      return false;
    }
    next();
  }

  /**
   * @description Checks the validity of the documents parameters
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} false
   * @memberof Utils
   */
  static isDocumentValid(request, response, next) {
    if (!request.body.title && validator.isEmpty(request.body.title)) {
      response.status(400).send({
        message: 'Title is Required',
      });
      return false;
    }
    if (!request.body.content && validator.isEmpty(request.body.content)) {
      response.status(400).send({
        message: 'Content is Required',
      });
      return false;
    }
    if (!request.body.access && validator.isEmpty(request.body.access)) {
      response.status(400).send({
        message: 'Access is Required',
      });
      return false;
    }
    if (!(['Public', 'Private', 'Role'].includes(request.body.access))) {
      response.status(400).send({
        message: 'Invalid Access Type',
      });
      return false;
    }
    next();
  }
}

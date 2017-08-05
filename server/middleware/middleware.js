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
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} false
   * @memberof Utils
   */
  static authenticate(req, res, next) {
    if (!req.headers.authorization) {
      res.status(401).send({
        message: 'You are not signed in',
      });
      return false;
    }
    const token = req.headers.authorization;
    req.token = token;
    req.loggedInUser = jwt.verify(req.token,
      process.env.JWT_SECRET);
    next();
  }

  /**
   * @description Checks if User is an Admin
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} false
   * @memberof Utils
   */
  static isAdmin(req, res, next) {
    if (req.loggedInUser.roleId === 3) {
      res.status(403).send({
        message: 'You do not have access to this request!!!',
      });
      return false;
    }
    next();
  }

  /**
   * @description Checks if User is a Super Admin
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isSuperAdmin(req, res, next) {
    if (req.loggedInUser.roleId !== 1) {
      res.status(403).send({
        message: 'You do not have access to this request!!!',
      });
      return false;
    }
    if (req.loggedInUser.roleId === 1) {
      req.admin = true;
      return true;
    }
    next();
  }

  /**
   * @description Validates User parameters
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} false
   * @memberof Utils
   */
  static isUserValid(req, res, next) {
    if (!req.body.email && validator.isEmpty(req.body.email) === true) {
      res.status(400).send({
        message: 'Email is Required',
      });
      return false;
    }
    if (!req.body.password && validator.isEmpty(req.body.password) === true) {
      res.status(400).send({
        message: 'Password is Required',
      });
      return false;
    }
    if (req.body.email && validator.isEmail(req.body.email) === false) {
      res.status(400).send({
        message: 'Invalid Email',
      });
      return false;
    }
    next();
  }

  /**
   * @description Checks the validity of the documents parameters
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {function} next Tell the next function to execute
   * @returns {boolean} false
   * @memberof Utils
   */
  static isDocumentValid(req, res, next) {
    if (!req.body.title && validator.isEmpty(req.body.title) === true) {
      res.status(400).send({
        message: 'Title is Required',
      });
      return false;
    }
    if (!req.body.content && validator.isEmpty(req.body.content) === true) {
      res.status(400).send({
        message: 'Content is Required',
      });
      return false;
    }
    if (!req.body.access && validator.isEmpty(req.body.access) === true) {
      res.status(400).send({
        message: 'Access is Required',
      });
      return false;
    }
    if (!(['Public', 'Private', 'Role'].includes(req.body.access))) {
      res.status(400).send({
        message: 'Invalid Access Type',
      });
      return false;
    }
    next();
  }
}

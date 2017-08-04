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
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static authenticate(req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).send({
        message: 'You are not signed in',
      });
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
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static isAdmin(req, res, next) {
    if (req.loggedInUser.roleId === 3) {
      return res.status(403).send({
        message: 'You do not have access to this request!!!',
      });
    }
    next();
  }

  /**
   * @description Checks if User is a Super Admin
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {function} next Tell the next function to execute
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static isSuper(req, res, next) {
    if (req.loggedInUser.roleId !== 1) {
      return res.status(403).send({
        message: 'You do not have access to this request!!!',
      });
    }
    if (req.loggedInUser.roleId === 1) {
      req.admin = true;
    }
    next();
  }

  /**
   * @description Validates User parameters
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {function} next Tell the next function to execute
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static isUserValid(req, res, next) {
    if (!req.body.email && validator.isEmpty(req.body.email) === true) {
      return res.status(400).send({
        message: 'Email is Required',
      });
    }
    if (!req.body.password && validator.isEmpty(req.body.password) === true) {
      return res.status(400).send({
        message: 'Password is Required',
      });
    }
    if (req.body.email && validator.isEmail(req.body.email) === false) {
      return res.status(400).send({
        message: 'Invalid Email',
      });
    }
    next();
  }

  /**
   * @description Checks the validity of the documents parameters
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {function} next Tell the next function to execute
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static isDocumentValid(req, res, next) {
    if (!req.body.title && validator.isEmpty(req.body.title) === true) {
      return res.status(400).send({
        message: 'Title is Required',
      });
    }
    if (!req.body.content && validator.isEmpty(req.body.content) === true) {
      return res.status(400).send({
        message: 'Content is Required',
      });
    }
    if (!req.body.access && validator.isEmpty(req.body.access) === true) {
      return res.status(400).send({
        message: 'Access is Required',
      });
    }
    if (!(['Public', 'Private', 'Role'].includes(req.body.access))) {
      return res.status(400).send({
        message: 'Invalid Access Type',
      });
    }
    next();
  }
}

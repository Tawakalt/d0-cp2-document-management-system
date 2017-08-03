import localStorage from 'local-storage';
import validator from 'validator';
import jwt from 'jsonwebtoken';

require('dotenv').config();

/**
 * @description Contains Authentication middleware and User Related Logic
 * @export
 * @class Utils
 */
export default class Utils {
  /**
   * @description Checks if User is Loggedin
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {function} next Tell the next function to execute
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static isLoggedIn(req, res, next) {
    if (!localStorage.get('token')) {
      return res.status(401).send({
        message: 'You are not signed in',
      });
    }
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
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    if (loggedInUser.roleId === 3) {
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
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    if (loggedInUser.roleId !== 1) {
      return res.status(403).send({
        message: 'You do not have access to this request!!!',
      });
    }
    if (loggedInUser.roleId === 1) {
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
  static isValid(req, res, next) {
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
   * @description Checks if User exists
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {object} user User details
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static isUser(req, res, user) {
    if (!user) {
      if (req.url === '/api/v1/users/login') {
        return res.status(401).send({
          message: 'Kindly Sign Up First'
        });
      }
      return res.status(404).send({
        message: 'User Not Found'
      });
    }
    return false;
  }

  /**
   * @description Checks if Email Exists
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {object} user user details
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static doesEmailExist(req, res, user) {
    if (user) {
      return res.status(400).send({
        message: 'Email already exists',
      });
    }
    return false;
  }

  /**
   * @description Checks if Parameters are Valid
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {string} email user's email
   * @param {string} password user's password
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static isValidParams(req, res, email, password) {
    if (email === '' || (email && validator.isEmpty(email) === true)) {
      return res.status(400).send({
        message: 'Email is Required!!!',
      });
    }
    if (password === '' || (password && validator.isEmpty(password) === true)) {
      return res.status(400).send({
        message: 'Password is Required!!!',
      });
    }
    if (email && validator.isEmail(email) === false) {
      return res.status(400).send({
        message: 'Invalid Email!!!',
      });
    }
    return false;
  }

  /**
   * @description Checks Authorization for Update
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {object} loggedInUser Details of the logged in user
   * @param {integer} userId Id of the User whose details is to be updated
   * @param {object} details Updated User details
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static allowUpdate(req, res, loggedInUser, userId, details) {
    if (loggedInUser.roleId !== 1 && loggedInUser.id !== parseInt(userId)) {
      return res.status(403).send({
        message: 'You cannot update someone else\'s details',
      });
    }
    if ((loggedInUser.roleId !== 1 && details.roleId) ||
      (loggedInUser.id === userId && details.roleId !== undefined)) {
      return res.status(403).send({
        message: 'Common stop it!!! You can\'t change your role',
      });
    }
    if (loggedInUser.roleId === 1 && loggedInUser.id !== userId &&
      (details.email || details.password)) {
      let message = 'You only have acess to change a user\'s role, ';
      message += 'not their email and definitely not their password!!!';
      return res.status(403).send({
        message,
      });
    }
    return false;
  }

  /**
   * @description Checks Authorization for Delete
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {integer} userId Id of the User to be deleted
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static allowDelete(req, res, userId) {
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    if (loggedInUser.id === parseInt(userId)) {
      return res.status(403).send({
        message: 'You cannot delete yourself!!!',
      });
    }
    return false;
  }

  /**
   * @description Validates Role
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {integer} roleId Users roleId
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static isRoleValid(req, res, roleId) {
    if (roleId &&
      validator.isNumeric(roleId) === false) {
      return res.status(400).send({
        message: 'Invalid RoleId!!!',
      });
    }
    return false;
  }

  /**
   * @description Checks for Validation Error
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {string} err Server error
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static checkError(req, res, err) {
    let SeqError = 'SequelizeForeignKeyConstraintError: ';
    SeqError += 'insert or update on table "Users" ';
    SeqError += 'violates foreign key constraint ';
    SeqError += '"Users_roleId_fkey"';
    if (err.toString() === SeqError) {
      return res.status(400).send({
        message: 'There is no role with that RoleId!!!',
      });
    }
    if (err.toString() ===
      'SequelizeUniqueConstraintError: Validation error') {
      return res.status(400).send({
        message: 'Your Edited Email already exists!!!',
      });
    }
    return false;
  }
}

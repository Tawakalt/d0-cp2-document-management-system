import validator from 'validator';

require('dotenv').config();

/**
 * @description Contains Authentication middleware and User Related Logic
 * @export
 * @class Utils
 */
export default class Utils {
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
   * @param {integer} userId Id of the User whose details is to be updated
   * @param {object} details Updated User details
   * @returns {object} response which includes status and and message
   * @memberof Utils
   */
  static allowUpdate(req, res, userId, details) {
    if (req.loggedInUser.roleId !== 1 &&
      req.loggedInUser.id !== parseInt(userId)) {
      return res.status(403).send({
        message: 'You cannot update someone else\'s details',
      });
    }
    if ((req.loggedInUser.roleId !== 1 && details.roleId) ||
      (req.loggedInUser.id === userId && details.roleId !== undefined)) {
      return res.status(403).send({
        message: 'Common stop it!!! You can\'t change your role',
      });
    }
    if (req.loggedInUser.roleId === 1 && req.loggedInUser.id !== userId &&
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
    if (req.loggedInUser.id === parseInt(userId)) {
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

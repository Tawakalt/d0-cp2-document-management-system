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
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isUser(req, res, user) {
    if (!user) {
      if (req.url === '/api/v1/users/login') {
        res.status(401).send({
          message: 'Kindly Sign Up First'
        });
        return false;
      }
      res.status(404).send({
        message: 'User Not Found'
      });
      return false;
    }
    return true;
  }

  /**
   * @description Checks if Email Exists
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {object} user user details
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static allowEmail(req, res, user) {
    if (user) {
      res.status(400).send({
        message: 'Email already exists',
      });
      return false;
    }
    return true;
  }

  /**
   * @description Checks if Parameters are Valid
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {string} email user's email
   * @param {string} password user's password
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isValidParams(req, res, email, password) {
    if (email === '' || (email && validator.isEmpty(email) === true)) {
      res.status(400).send({
        message: 'Email is Required!!!',
      });
      return false;
    }
    if (password === '' || (password && validator.isEmpty(password) === true)) {
      res.status(400).send({
        message: 'Password is Required!!!',
      });
      return false;
    }
    if (email && validator.isEmail(email) === false) {
      res.status(400).send({
        message: 'Invalid Email!!!',
      });
      return false;
    }
    return true;
  }

  /**
   * @description Checks Authorization for Update
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {integer} userId Id of the User whose details is to be updated
   * @param {object} details Updated User details
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static allowUpdate(req, res, userId, details) {
    if (req.loggedInUser.roleId !== 1 &&
      req.loggedInUser.id !== parseInt(userId)) {
      res.status(403).send({
        message: 'You cannot update someone else\'s details',
      });
      return false;
    }
    if ((req.loggedInUser.roleId !== 1 && details.roleId) ||
      (req.loggedInUser.id === userId && details.roleId !== undefined)) {
      res.status(403).send({
        message: 'Common stop it!!! You can\'t change your role',
      });
      return false;
    }
    if (req.loggedInUser.roleId === 1 && req.loggedInUser.id !== userId &&
      (details.email || details.password)) {
      let message = 'You only have acess to change a user\'s role, ';
      message += 'not their email and definitely not their password!!!';
      res.status(403).send({
        message,
      });
      return false;
    }
    return true;
  }

  /**
   * @description Checks Authorization for Delete
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {integer} userId Id of the User to be deleted
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static allowDelete(req, res, userId) {
    if (req.loggedInUser.id === parseInt(userId)) {
      res.status(403).send({
        message: 'You cannot delete yourself!!!',
      });
      return false;
    }
    return true;
  }

  /**
   * @description Validates Role
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {integer} roleId Users roleId
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isRoleValid(req, res, roleId) {
    if (roleId &&
      validator.isNumeric(roleId) === false) {
      res.status(400).send({
        message: 'Invalid RoleId!!!',
      });
      return false;
    }
    return true;
  }

  /**
   * @description Checks for Validation Error
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {string} err Server error
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static validationError(req, res, err) {
    let SeqError = 'SequelizeForeignKeyConstraintError: ';
    SeqError += 'insert or update on table "Users" ';
    SeqError += 'violates foreign key constraint ';
    SeqError += '"Users_roleId_fkey"';
    if (err.toString() === SeqError) {
      res.status(400).send({
        message: 'There is no role with that RoleId!!!',
      });
      return true;
    }
    if (err.toString() ===
      'SequelizeUniqueConstraintError: Validation error') {
      res.status(400).send({
        message: 'Your Edited Email already exists!!!',
      });
      return true;
    }
    return false;
  }

  /**
   * @description Validates user ID for retrieval
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {any} userId Id of the document to be retrieved
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static userIdValid(req, res, userId) {
    if (!validator.isNumeric(userId)) {
      res.status(400).send({
        message: 'User Id must be an integer',
      });
      return false;
    }
    return true;
  }
}

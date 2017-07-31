import jwt from 'jsonwebtoken';
import localStorage from 'local-storage';
import validator from 'validator';

/**
 * @description Contains all Document Related Logic
 * @export
 * @class Utils
 */
export default class Utils {
  /**
   * @description Checks the validity of the documents parameters
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response 
   * @param {function} next Tell the next function to execute
   * @returns {object} response which includes status and and message 
   * @memberof Utils
   */
  static isValid(req, res, next) {
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

  /**
   * @description checks if Title exists
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response 
   * @param {object} doc The returned document
   * @returns {object} response which includes status and and message 
   * @memberof Utils
   */
  static doesTitleExist(req, res, doc) {
    if (doc) {
      return res.status(400).send({
        message: 'Title already exists',
      });
    }
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    req.loggedInUser = loggedInUser.id;
    return false;
  }

  /**
   * @description adds more properties to the query
   * @static
   * @param {integer} limit Number of rows to be returned
   * @param {integer} offset Number of rows to be skipped
   * @param {object} property query property
   * @returns {object} response which includes status and and message 
   * @memberof Utils
   */
  static listQuery(limit, offset, property) {
    if (limit && offset) {
      property.limit = limit;
      property.offset = offset;
    }
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    if (loggedInUser.roleId === 3) {
      property.where = { userId: loggedInUser.id };
    }
    return property;
  }

  /**
   * @description Checks if document exists
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {object} doc 
   * @returns {object} response which includes status and and message 
   * @memberof Utils
   */
  static isDoc(req, res, doc) {
    if (!doc) {
      return res.status(404).send({
        message: 'Document Not Found'
      });
    }
    return false;
  }

  /**
   * @description Checks Authorization for viewing
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response 
   * @param {object} doc 
   * @returns {object} response which includes status and and message 
   * @memberof Utils
   */
  static isAllowed(req, res, doc) {
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    const allowed = [doc.User.roleId, 1, 2];
    if ((doc.access === 'Private' && doc.userId !== loggedInUser.id) ||
    (doc.access === 'Role' && allowed.includes(loggedInUser.roleId)
    === false)) {
      return res.status(401).send({
        message: 'You are not authorized to view this document'
      });
    }
    return false;
  }

  /**
   * @description Checks Authorization for updating
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response 
   * @param {integer} ownerId 
   * @returns {object} response which includes status and and message 
   * @memberof Utils
   */
  static allowUpdate(req, res, ownerId) {
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    if (loggedInUser.roleId !== 1 && loggedInUser.id !== parseInt(ownerId)) {
      return res.status(401).send({
        message: 'You cannot update someone else\'s document',
      });
    }
    return false;
  }

  /**
   * @description Checks Validity of parameters
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response 
   * @returns {object} response which includes status and and message 
   * @memberof Utils
   */
  static isValidParams(req, res) {
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
    return false;
  }

  /**
   * @description checks validation error
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response 
   * @param {object} err 
   * @returns {object} response which includes status and and message 
   * @memberof Utils
   */
  static checkError(req, res, err) {
    if (err.toString() ===
      'SequelizeUniqueConstraintError: Validation error') {
      return res.status(400).send({
        message: 'Your Edited Title already exists!!!',
      });
    }
    return false;
  }

  /**
   * @description Checks Authorization for deleting
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @param {integer} ownerId 
   * @returns {object} response which includes status and and message 
   * @memberof Utils
   */
  static allowDelete(req, res, ownerId) {
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    if (loggedInUser.roleId !== 1 && loggedInUser.id !== parseInt(ownerId)) {
      return res.status(401).send({
        message: 'You cannot delete someone else\'s document',
      });
    }
    return false;
  }
}

import jwt from 'jsonwebtoken';
import localStorage from 'local-storage';
import validator from 'validator';

export default class Utils {
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

  static isDoc(req, res, doc) {
    if (!doc) {
      return res.status(404).send({
        message: 'Document Not Found'
      });
    }
    return false;
  }

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

  static checkError(req, res, err) {
    if (err.toString() ===
      'SequelizeUniqueConstraintError: Validation error') {
      return res.status(400).send({
        message: 'Your Edited Title already exists!!!',
      });
    }
    return false;
  }

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

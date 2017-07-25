import jwt from 'jsonwebtoken';
import localStorage from 'local-storage';
import validator from 'validator';

export default class Utils {
  static isValid(req, res, next) {
    if (!req.body.title && validator.isEmpty(req.body.title) === true) {
      return res.status(404).send({
        message: 'Title is Required',
      });
    }
    if (!req.body.content && validator.isEmpty(req.body.content) === true) {
      return res.status(404).send({
        message: 'Content is Required',
      });
    }
    if (!req.body.access && validator.isEmpty(req.body.access) === true) {
      return res.status(404).send({
        message: 'Access is Required',
      });
    }
    if (!(['Public', 'Private', 'Role'].includes(req.body.access))) {
      return res.status(404).send({
        message: 'Invalid Access Type',
      });
    }
    next();
  }

  static doesTitleExist(res, req, doc) {
    if (doc) {
      return res.status(404).send({
        message: 'Title already exists',
      });
    }
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    req.loggedInUser = loggedInUser.id;
    return false;
  }
}

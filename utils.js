import localStorage from 'local-storage';
import validator from 'validator';
import jwt from 'jsonwebtoken';

require('dotenv').config();

export default class Utils {
  static isLoggedIn(req, res, next) {
    if (!localStorage.get('token')) {
      return res.status(404).send({
        message: 'You are not signed in',
      });
    }
    next();
  }

  static isAdmin(req, res, next) {
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    if (loggedInUser.roleId === 3) {
      return res.status(404).send({
        message: 'You do not have access to this request!!!',
      });
    }
    next();
  }

  static isSuper(req, res, next) {
    const loggedInUser = jwt.verify(localStorage.get('token'),
      process.env.JWT_SECRET);
    if (loggedInUser.roleId !== 1) {
      return res.status(404).send({
        message: 'You do not have access to this request!!!',
      });
    }
    if (loggedInUser.roleId === 1) {
      req.admin = true;
    }
    next();
  }

  static isValid(req, res, next) {
    if (!req.body.email && validator.isEmpty(req.body.email) === true) {
      return res.status(404).send({
        message: 'Email is Required',
      });
    }
    if (!req.body.password && validator.isEmpty(req.body.password) === true) {
      return res.status(404).send({
        message: 'Password is Required',
      });
    }
    if (req.body.email && validator.isEmail(req.body.email) === false) {
      return res.status(404).send({
        message: 'Invalid Email',
      });
    }
    next();
  }

  static isUser(req, res, user) {
    if (!user) {
      let message;
      if (req.url === '/api/v1/users/login') {
        message = 'Kindly Sign Up First';
      } else {
        message = 'User Not Found';
      }
      return res.status(400).send({
        message,
      });
    }
    return false;
  }

  static doesEmailExist(req, res, user) {
    if (user) {
      return res.status(404).send({
        message: 'Email already exists',
      });
    }
    return false;
  }

  static isValidParams(req, res, email, password) {
    if (email === '' || (email && validator.isEmpty(email) === true)) {
      return res.status(404).send({
        message: 'Email is Required!!!',
      });
    }
    if (password === '' || (password && validator.isEmpty(password) === true)) {
      return res.status(404).send({
        message: 'Password is Required!!!',
      });
    }
    if (email && validator.isEmail(email) === false) {
      return res.status(404).send({
        message: 'Invalid Email!!!',
      });
    }
    return false;
  }

  static allowUpdate(req, res, loggedInUser, userId, details) {
    if (loggedInUser.roleId !== 1 && loggedInUser.id !== parseInt(userId)) {
      return res.status(404).send({
        message: 'You cannot update someone else\'s details',
      });
    }
    if ((loggedInUser.roleId !== 1 && details.roleId) ||
      (loggedInUser.id === userId && details.roleId !== undefined)) {
      return res.status(404).send({
        message: 'Common stop it!!! You can\'t change your role',
      });
    }
    if (loggedInUser.roleId === 1 && loggedInUser.id !== userId &&
      (details.email || details.password)) {
      let message = 'You only have acess to change a user\'s role, ';
      message += 'not their email and definitely not their password!!!';
      return res.status(404).send({
        message,
      });
    }
    return false;
  }

  static isRoleValid(req, res, roleId) {
    if (roleId &&
      validator.isNumeric(roleId) === false) {
      return res.status(404).send({
        message: 'Invalid RoleId!!!',
      });
    }
    return false;
  }

  static checkError(req, res, err) {
    let SeqError = 'SequelizeForeignKeyConstraintError: ';
    SeqError += 'insert or update on table "Users" ';
    SeqError += 'violates foreign key constraint ';
    SeqError += '"Users_roleId_fkey"';
    if (err.toString() === SeqError) {
      return res.status(404).send({
        message: 'There is no role with that RoleId!!!',
      });
    }
    if (err.toString() ===
      'SequelizeUniqueConstraintError: Validation error') {
      return res.status(404).send({
        message: 'Your Edited Email already exists!!!',
      });
    }
    return false;
  }
}

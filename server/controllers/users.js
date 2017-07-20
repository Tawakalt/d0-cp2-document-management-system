const validator = require('validator');
const User = require('../models').User;
const bcrypt = require('bcrypt');

const saltRounds = 10;

module.exports = {
  create(req, res) {
    if (validator.isEmail(req.body.email) === false) {
      return res.status(404).send({
        message: 'Invalid Email',
      });
    }
    return User
      .find({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        if (user) {
          return res.status(404).send({
            message: 'Email already exists',
          });
        }
        if (req.params.roleId) {
          roleId = req.params.roleId;
        } else {
          roleId = 3;
        }
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
          return User
            .create({
              email: req.body.email,
              password: hash,
              roleId,
            })
            .then(res.status(201).send({
              message: 'User successfully created' }))
            .catch(error => res.status(400).send(error.toString()));
        });
      })
      .catch(error => res.status(400).send(error.toString()));
  },

  list(req, res) {
    return User
      .all()
      .then((user) => {
        let count = user.length - 1;
        while (count >= 0) {
          if (user[count].roleId === 1) {
            user[count].roleId = 'Super Admin';
          } else if (user[count].roleId === 2) {
            user[count].roleId = 'Admin';
          } else {
            user[count].roleId = 'Regular';
          }
          count -= 1;
        }
        res.status(200).send(user);
      })
      .catch(error => res.status(400).send(error.toString()));
  },
};

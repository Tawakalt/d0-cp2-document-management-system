const User = require('../models').User;
const bcrypt = require('bcrypt');

const saltRounds = 10;

module.exports = {
  create(req, res) {
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
};

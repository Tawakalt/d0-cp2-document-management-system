import validator from 'validator';
import Utils from '../../utils';

const User = require('../models').User;
const Role = require('../models').Role;

export default class searchController {
  static userSearch(req, res) {
    if (req.query.q && validator.isEmail(req.query.q) === false) {
      return res.status(404).send({
        message: 'Invalid Email!!!',
      });
    }
    return User
      .findOne({
        where: {
          email: req.query.q,
        },
        include: [
          { model: Role }
        ],
      })
      .then((user) => {
        if (!Utils.isUser(res, req, user)) {
          return res.status(200).send(user);
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }
}

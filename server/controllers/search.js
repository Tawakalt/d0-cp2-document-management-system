import validator from 'validator';
import Utils from '../helper/utils';
import utils from '../helper/documentsLogic';

const User = require('../models').User;
const Role = require('../models').Role;
const Document = require('../models').Document;

/**
 * @description Contains all Search Related Functions
 * @export
 * @class searchController
 */
export default class searchController {
  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Search for Users
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof searchController
   */
  static userSearch(req, res) {
    if (req.query.q && validator.isEmail(req.query.q) === false) {
      return res.status(400).send({
        message: 'Invalid Email!!!',
      });
    }
    return User
      .findOne({
        where: {
          email: req.query.q,
        },
        include: [
          { model: Role,
            attributes: ['role']
          }
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password']
        },
      })
      .then((user) => {
        if (Utils.isUser(req, res, user)) {
          return res.status(200).send(user);
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Search for Documents
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof searchController
   */
  static docSearch(req, res) {
    return Document
      .findOne({
        where: {
          title: req.query.q,
        },
        include: [
          { model: User,
            attributes: ['email']
          }
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      })
      .then((doc) => {
        if (utils.isDoc(req, res, doc)) {
          if (utils.isAllowed(req, res, doc)) {
            return res.status(200).send(doc);
          }
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }
}

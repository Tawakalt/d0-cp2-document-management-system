import Utils from '../helper/utils';
import utils from '../helper/documentsLogic';

const User = require('../models').User;
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
    const searchString = req.query.q.trim();
    return User
      .findAll({
        where: {
          email: { $ilike: `%${searchString}%` },
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'password']
        },
      })
      .then((user) => {
        if (Utils.isUser(req, res, user)) {
          if (user.length === 0) {
            return res.status(404).send({ message: 'No User Found' });
          }
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
    const searchString = req.query.q.trim();
    return Document
      .findAll({
        where: {
          title: { $ilike: `%${searchString}%` },
        },
        include: [
          { model: User,
            attributes: ['email', 'roleId']
          }
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      })
      .then((doc) => {
        if (utils.isDoc(req, res, doc)) {
          if (utils.filter(req, res, doc)) {
            return res.status(200).send(doc);
          }
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }
}

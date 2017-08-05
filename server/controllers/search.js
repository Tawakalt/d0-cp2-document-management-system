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
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof searchController
   */
  static userSearch(request, response) {
    const searchString = request.query.q.trim();
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
        if (Utils.isUser(request, response, user)) {
          if (user.length === 0) {
            return response.status(404).send({ message: 'No User Found' });
          }
          return response.status(200).send(user);
        }
      })
      .catch(error => response.status(400).send(error.toString()));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Search for Documents
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof searchController
   */
  static docSearch(request, response) {
    const searchString = request.query.q.trim();
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
        if (utils.isDoc(request, response, doc)) {
          if (utils.filter(request, response, doc)) {
            return response.status(200).send(doc);
          }
        }
      })
      .catch(error => response.status(400).send(error.toString()));
  }
}

import Utils from '../helper/Utils';
import DocumentsLogic from '../helper/DocumentsLogic';

const User = require('../models').User;
const Document = require('../models').Document;

/**
 * @description Contains all Search Related Functions
 * @export
 * @class searchController
 */
export default class SearchController {
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
      .then((document) => {
        if (DocumentsLogic.isDocument(request, response, document)) {
          DocumentsLogic.filter(request, response, document);
          DocumentsLogic.paginate(request, response, response.document);
        }
      })
      .catch(error => response.status(400).send(error.toString()));
  }
}

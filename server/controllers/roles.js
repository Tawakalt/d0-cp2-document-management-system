import validator from 'validator';

const Role = require('../models').Role;

/**
 * @description Contains all Roles Related Functions
 * @export
 * @class rolesController
 */
export default class rolesController {
  /**
   * @description Allows Authorized Registered and Loggedin Personnels 
   *              to Create Roles
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response 
   * @returns {object} response which includes status and and message
   * @memberof rolesController
   */
  static create(request, response) {
    if (!request.body.role &&
      (validator.isEmpty(request.body.role) ||
      validator.isNumeric(request.body.role))) {
      return response.status(400).send({
        message: 'Invalid Role',
      });
    }
    return Role
      .create({
        role: request.body.role,
      })
      .then((role) => {
        response.status(201).send({
          message: 'Role successfully created', role });
      })
      .catch(error => response.status(400).send(error));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to View all Documents
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof rolesController
   */
  static list(request, response) {
    return Role
      .findAll({
        order: [
          ['id', 'ASC']
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      })
      .then(role => response.status(200).send(role))
      .catch(error => response.status(400).send(error.toString()));
  }
}

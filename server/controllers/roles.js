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
   * @param {object} req Client's request
   * @param {object} res Server Response 
   * @returns {object} response which includes status and and message
   * @memberof rolesController
   */
  static create(req, res) {
    if (!req.body.role &&
      (validator.isEmpty(req.body.role) ||
      validator.isNumeric(req.body.role))) {
      return res.status(400).send({
        message: 'Invalid Role',
      });
    }
    return Role
      .create({
        role: req.body.role,
      })
      .then((role) => {
        res.status(201).send({
          message: 'Role successfully created', role });
      })
      .catch(error => res.status(400).send(error));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to View all Documents
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof rolesController
   */
  static list(req, res) {
    return Role
      .findAll({
        order: [
          ['id', 'ASC']
        ],
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      })
      .then(role => res.status(200).send(role))
      .catch(error => res.status(400).send(error.toString()));
  }
}

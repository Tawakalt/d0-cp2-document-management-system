const Role = require('../models').Role;
const User = require('../models').User;

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
    return Role
      .create({
        role: req.body.role,
      })
      .then(res.status(201).send({
        message: 'Role successfully created' }))
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
        include: [{
          model: User,
          as: 'users',
        }],
        order: [
          ['id', 'ASC']
        ]
      })
      .then(role => res.status(200).send(role))
      .catch(error => res.status(400).send(error.toString()));
  }
}

import Utils from '../helper/documentsLogic';

const Document = require('../models').Document;
const User = require('../models').User;

/**
 * @description Contains all Document Related Functions
 * @export
 * @class documentsController
 */
export default class documentsController {
  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Create Documents
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static create(req, res) {
    return Document
      .findOne({
        where: {
          title: req.body.title,
        },
      })
      .then((doc) => {
        if (Utils.titleExist(req, res, doc)) {
          return Document
            .create({
              title: req.body.title,
              content: req.body.content,
              access: req.body.access,
              userId: req.loggedInUser.id
            })
            .then(createdDocument => res.status(201).send({
              message: 'Document successfully created', createdDocument }))
            .catch(error => res.status(500).send(error.toString()));
        }
      })
      .catch(error => res.status(500).send(error.toString()));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to View all Documents
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static list(req, res) {
    const property = {
      order: [
        ['id', 'DESC']
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    };
    if (Utils.listQuery(
      req, res, req.query.limit, req.query.offset, property)) {
      return Document
        .findAll(res.property)
        .then((Documents) => {
          if (Documents.length === 0) {
            return res.status(200).send({
              message: 'No Document has been created' });
          }
          Utils.paginate(req, res, Documents);
        });
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Get a specific Document
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static retrieve(req, res) {
    if (Utils.docIdValid(req, res, req.params.docId)) {
      return Document
        .findById(req.params.docId, {
          include: [{
            model: User,
            attributes: ['email']
          }],
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        })
        .then((doc) => {
          if (Utils.isDoc(req, res, doc)) {
            if (Utils.isAllowed(req, res, doc)) {
              delete doc.dataValues.User;
              return res.status(200).send(doc);
            }
          }
        })
        .catch(error => res.status(500).send(error.toString()));
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Update a Document
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static update(req, res) {
    if (Utils.docIdValid(req, res, req.params.docId)) {
      return Document
        .findById(req.params.docId, {
          include: [{
            model: User,
          }],
        })
        .then((doc) => {
          if (Utils.isDoc(req, res, doc)) {
            if (Utils.allowUpdate(req, res, doc.userId)) {
              if (Utils.isValidParams(req, res)) {
                return doc
                  .update({
                    title: req.body.title || doc.title,
                    content: req.body.content || doc.content,
                    access: req.body.access || doc.access,
                  })
                  .then((updatedDetails) => {
                    delete updatedDetails.dataValues.User;
                    res.status(200).send({
                      message: 'Update Successful', updatedDetails
                    });
                  })
                  .catch((err) => {
                    if (!Utils.validationError(req, res, err)) {
                      res.status(500).send(err.toString());
                    }
                  });
              }
            }
          }
        })
        .catch(error => res.status(500).send(error.toString()));
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Delete a Document
   * @static
   * @param {object} req Client's request
   * @param {object} res Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static destroy(req, res) {
    if (Utils.docIdValid(req, res, req.params.docId)) {
      return Document
        .findById(req.params.docId)
        .then((doc) => {
          if (Utils.isDoc(req, res, doc)) {
            if (Utils.allowDelete(req, res, doc.userId)) {
              return doc
                .destroy()
                .then(() => res.status(200).send({
                  message: 'Document successfully deleted' }))
                .catch(err => res.status(500).send(err.toString()));
            }
          }
        })
        .catch(error => res.status(500).send(error.toString()));
    }
  }
}

import DocumentsLogic from '../helper/DocumentsLogic';

const Document = require('../models').Document;
const User = require('../models').User;

/**
 * @description Contains all Document Related Functions
 * @export
 * @class documentsController
 */
export default class DocumentsController {
  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Create Documents
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static create(request, response) {
    return Document
      .findOne({
        where: {
          title: request.body.title,
        },
      })
      .then((document) => {
        if (!DocumentsLogic.titleExist(request, response, document)) {
          return Document
            .create({
              title: request.body.title,
              content: request.body.content,
              access: request.body.access,
              userId: request.loggedInUser.id
            })
            .then(createdDocument => response.status(201).send({
              message: 'Document successfully created', createdDocument }))
            .catch(error => response.status(500).send(error.toString()));
        }
      })
      .catch(error => response.status(500).send(error.toString()));
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to View all Documents
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static list(request, response) {
    const property = {
      order: [
        ['id', 'DESC']
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    };
    if (DocumentsLogic.listQuery(
      request, response, request.query.limit, request.query.offset, property)) {
      return Document
        .findAll(response.property)
        .then((Documents) => {
          if (Documents.length === 0) {
            return response.status(200).send({
              message: 'No Document has been created' });
          }
          DocumentsLogic.paginate(request, response, Documents);
        });
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Get a specific Document
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static retrieve(request, response) {
    if (DocumentsLogic.documentIdValid(
      request, response, request.params.documentId)) {
      return Document
        .findById(request.params.documentId, {
          include: [{
            model: User,
            attributes: ['email']
          }],
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        })
        .then((document) => {
          if (DocumentsLogic.isDocument(request, response, document)) {
            if (DocumentsLogic.isAllowed(request, response, document)) {
              delete document.dataValues.User;
              return response.status(200).send(document);
            }
          }
        })
        .catch(error => response.status(500).send(error.toString()));
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Update a Document
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static update(request, response) {
    if (DocumentsLogic.documentIdValid(
      request, response, request.params.documentId)) {
      return Document
        .findById(request.params.documentId, {
          include: [{
            model: User,
          }],
        })
        .then((document) => {
          if (DocumentsLogic.isDocument(request, response, document)) {
            if (DocumentsLogic.allowUpdate(
              request, response, document.userId)) {
              if (DocumentsLogic.isValidParams(request, response)) {
                return document
                  .update({
                    title: request.body.title || document.title,
                    content: request.body.content || document.content,
                    access: request.body.access || document.access,
                  })
                  .then((updatedDetails) => {
                    delete updatedDetails.dataValues.User;
                    response.status(200).send({
                      message: 'Update Successful', updatedDetails
                    });
                  })
                  .catch((err) => {
                    if (!DocumentsLogic.validationError(
                      request, response, err)) {
                      response.status(500).send(err.toString());
                    }
                  });
              }
            }
          }
        })
        .catch(error => response.status(500).send(error.toString()));
    }
  }

  /**
   * @description Allows Authorized Registered and Loggedin Personnels
   *              to Delete a Document
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @returns {object} response which includes status and and message
   * @memberof documentsController
   */
  static destroy(request, response) {
    if (DocumentsLogic.documentIdValid(
      request, response, request.params.documentId)) {
      return Document
        .findById(request.params.documentId)
        .then((document) => {
          if (DocumentsLogic.isDocument(request, response, document)) {
            if (DocumentsLogic.allowDelete(
              request, response, document.userId)) {
              return document
                .destroy()
                .then(() => response.status(200).send({
                  message: 'Document successfully deleted' }))
                .catch(err => response.status(500).send(err.toString()));
            }
          }
        })
        .catch(error => response.status(500).send(error.toString()));
    }
  }
}

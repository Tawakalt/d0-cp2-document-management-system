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
      .then((doc) => {
        if (DocumentsLogic.titleExist(request, response, doc)) {
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
    if (DocumentsLogic.docIdValid(request, response, request.params.docId)) {
      return Document
        .findById(request.params.docId, {
          include: [{
            model: User,
            attributes: ['email']
          }],
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        })
        .then((doc) => {
          if (DocumentsLogic.isDoc(request, response, doc)) {
            if (DocumentsLogic.isAllowed(request, response, doc)) {
              delete doc.dataValues.User;
              return response.status(200).send(doc);
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
    if (DocumentsLogic.docIdValid(request, response, request.params.docId)) {
      return Document
        .findById(request.params.docId, {
          include: [{
            model: User,
          }],
        })
        .then((doc) => {
          if (DocumentsLogic.isDoc(request, response, doc)) {
            if (DocumentsLogic.allowUpdate(request, response, doc.userId)) {
              if (DocumentsLogic.isValidParams(request, response)) {
                return doc
                  .update({
                    title: request.body.title || doc.title,
                    content: request.body.content || doc.content,
                    access: request.body.access || doc.access,
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
    if (DocumentsLogic.docIdValid(request, response, request.params.docId)) {
      return Document
        .findById(request.params.docId)
        .then((doc) => {
          if (DocumentsLogic.isDoc(request, response, doc)) {
            if (DocumentsLogic.allowDelete(request, response, doc.userId)) {
              return doc
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

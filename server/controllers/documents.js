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
        if (!Utils.doesTitleExist(req, res, doc)) {
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
    if (!Utils.listQuery(
      req, res, req.query.limit, req.query.offset, property)) {
      return Document
        .findAll(res.property)
        .then((Documents) => {
          const totalCount = Documents.length;
          let pageCount = Math.round(totalCount / (req.query.limit || 10));
          pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
          const page = Math.round((req.query.offset || 0) /
          (req.query.limit || 10)) + 1;
          if (Documents.length === 0) {
            res.status(200).send({ message: 'No Document has been created' });
          }
          res.status(200).send({ Documents,
            metaData: {
              page,
              pageCount,
              count: Documents.length,
              totalCount,
            }
          });
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
        if (!Utils.isDoc(req, res, doc)) {
          if (!Utils.isAllowed(req, res, doc)) {
            delete doc.dataValues.User;
            return res.status(200).send(doc);
          }
        }
      })
      .catch(error => res.status(500).send(error.toString()));
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
    return Document
      .findById(req.params.docId, {
        include: [{
          model: User,
        }],
      })
      .then((doc) => {
        if (!Utils.isDoc(req, res, doc)) {
          if (!Utils.allowUpdate(req, res, doc.userId)) {
            if (!Utils.isValidParams(req, res)) {
              return doc
                .update({
                  title: req.body.title || doc.title,
                  content: req.body.content || doc.content,
                  access: req.body.access || doc.access,
                })
                .then((updatedDetails) => {
                  // console.log(updatedDetails);
                  delete updatedDetails.dataValues.User;
                  res.status(200).send({
                    message: 'Update Successful', updatedDetails
                  });
                })
                .catch((err) => {
                  if (!Utils.checkError(req, res, err)) {
                    res.status(500).send(err.toString());
                  }
                });
            }
          }
        }
      })
      .catch(error => res.status(500).send(error.toString()));
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
    return Document
      .findById(req.params.docId)
      .then((doc) => {
        if (!Utils.isDoc(req, res, doc)) {
          if (!Utils.allowDelete(req, res, doc.userId)) {
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

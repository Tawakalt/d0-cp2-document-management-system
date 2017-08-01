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
              userId: req.loggedInUser
            })
            .then(res.status(201).send({
              message: 'Document successfully created' }))
            .catch(error => res.status(400).send(error.toString()));
        }
      })
      .catch(error => res.status(400).send(error.toString()));
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
      include: [
        { model: User }
      ],
      order: [
        ['id', 'DESC']
      ]
    };
    if (!Utils.listQuery(res, req.query.limit, req.query.offset, property)) {
      return Document
        .findAll(res.property)
        .then((doc) => {
          const totalCount = doc.length;
          let pageCount = Math.round(totalCount / (req.query.limit || 10));
          pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
          const page = Math.round((req.query.offset || 0) /
          (req.query.limit || 10)) + 1;
          if (doc.length === 0) {
            res.status(200).send({ message: 'No Document has been created' });
          }
          res.status(200).send({ doc,
            metaData: {
              page,
              pageCount,
              count: doc.length,
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
        }],
      })
      .then((doc) => {
        if (!Utils.isDoc(req, res, doc)) {
          if (!Utils.isAllowed(req, res, doc)) {
            return res.status(200).send(doc);
          }
        }
      })
      .catch(error => res.status(400).send(error.toString()));
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
                .then(() => res.status(200).send({
                  message: 'Update Successful',
                }))
                .catch((err) => {
                  if (!Utils.checkError(req, res, err)) {
                    res.status(400).send(err.toString());
                  }
                });
            }
          }
        }
      })
      .catch(error => res.status(400).send(error.toString()));
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
              .catch(err => res.status(400).send(err.toString()));
          }
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }
}

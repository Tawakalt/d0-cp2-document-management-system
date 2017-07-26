import Utils from '../../logic/documentsLogic';

const Document = require('../models').Document;
const User = require('../models').User;

export default class documentsController {
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

  static list(req, res) {
    let property = {
      include: [
        { model: User }
      ],
      order: [
        ['id', 'DESC']
      ]
    };
    property = Utils.listQuery(req.query.limit, req.query.offset, property);
    return Document
      .findAll(property)
      .then((doc) => {
        if (doc.length === 0) {
          res.status(201).send({ message: 'No Document has been created' });
        } else {
          res.status(200).send(doc);
        }
      });
  }

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

  static destroy(req, res) {
    return Document
      .findById(req.params.docId)
      .then((doc) => {
        if (!Utils.isDoc(req, res, doc)) {
          if (!Utils.allowDelete(req, res, doc.userId)) {
            return doc
              .destroy()
              .then(() => res.status(400).send({
                message: 'Document successfully deleted' }))
              .catch(err => res.status(400).send(err.toString()));
          }
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }
}

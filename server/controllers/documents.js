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
        if (!Utils.doesTitleExist(res, req, doc)) {
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
        if (!Utils.isDoc(res, req, doc)) {
          if (!Utils.isAllowed(res, req, doc)) {
            return res.status(200).send(doc);
          }
        }
      })
      .catch(error => res.status(400).send(error.toString()));
  }
}

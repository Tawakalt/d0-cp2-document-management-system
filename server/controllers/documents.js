import Utils from '../../logic/documentsLogic';

const Document = require('../models').Document;

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
}

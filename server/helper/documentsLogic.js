import validator from 'validator';

/**
 * @description Contains all Document Related Logic
 * @export
 * @class Utils
 */
export default class Utils {
  /**
   * @description checks if Title exists
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {object} doc The returned document
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static titleExist(request, res, doc) {
    if (doc) {
      res.status(400).send({
        message: 'Title already exists',
      });
      return false;
    }
    return true;
  }

  /**
   * @description adds more properties to the query
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {integer} limit Number of rows to be returned
   * @param {integer} offset Number of rows to be skipped
   * @param {object} property query property
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static listQuery(request, res, limit, offset, property) {
    if (((limit && !(validator.isNumeric(limit)))
      && (offset && !(validator.isNumeric(offset))))
      || ((limit && limit <= 0) && (offset && offset < 0))) {
      res.status(400).send({
        message: 'Invalid Limit and Offset',
      });
      return false;
    } else if ((limit && !(validator.isNumeric(limit))) ||
    (limit && limit <= 0)) {
      res.status(400).send({
        message: 'Invalid Limit',
      });
      return false;
    } else if ((offset && !(validator.isNumeric(offset))) ||
    (offset && offset < 0)) {
      res.status(400).send({
        message: 'Invalid Offset',
      });
      return false;
    }
    property.limit = limit || 10;
    property.offset = offset || 0;
    if (request.loggedInUser.roleId === 3) {
      property.where = { userId: request.loggedInUser.id };
    }
    res.property = property;
    return true;
  }

  /**
   * @description Checks if document exists
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {object} doc the returned document
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isDoc(request, res, doc) {
    if (!doc) {
      res.status(404).send({
        message: 'Document Not Found'
      });
      return false;
    }
    return true;
  }

  /**
   * @description Checks Authorization for viewing
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {object} doc the returned document
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isAllowed(request, res, doc) {
    const allowed = [doc.User.roleId, 1, 2];
    if ((doc.access === 'Private' && doc.userId !== request.loggedInUser.id) ||
    (doc.access === 'Role' && allowed.includes(request.loggedInUser.roleId)
    === false)) {
      res.status(403).send({
        message: 'You are not authorized to view this document'
      });
      return false;
    }
    return true;
  }

  /**
   * @description Checks Authorization for updating
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {integer} ownerId id of the document owner
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static allowUpdate(request, res, ownerId) {
    if (request.loggedInUser.roleId !== 1 &&
      request.loggedInUser.id !== parseInt(ownerId)) {
      res.status(403).send({
        message: 'You cannot update someone else\'s document',
      });
      return false;
    }
    return true;
  }

  /**
   * @description Checks Validity of parameters
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isValidParams(request, res) {
    if (!request.body.title && validator.isEmpty(request.body.title)) {
      res.status(400).send({
        message: 'Title is Required',
      });
      return false;
    }
    if (!request.body.content && validator.isEmpty(request.body.content)) {
      res.status(400).send({
        message: 'Content is Required',
      });
      return false;
    }
    if (!request.body.access && validator.isEmpty(request.body.access)) {
      res.status(400).send({
        message: 'Access is Required',
      });
      return false;
    }
    if (!(['Public', 'Private', 'Role'].includes(request.body.access))) {
      res.status(400).send({
        message: 'Invalid Access Type',
      });
      return false;
    }
    return true;
  }

  /**
   * @description checks validation error
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {object} err server error
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static validationError(request, res, err) {
    if (err.toString() ===
      'SequelizeUniqueConstraintError: Validation error') {
      res.status(400).send({
        message: 'Your Edited Title already exists!!!',
      });
      return true;
    }
    return false;
  }

  /**
   * @description Checks Authorization for deleting
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {integer} ownerId id of the document owner
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static allowDelete(request, res, ownerId) {
    if (request.loggedInUser.roleId !== 1 &&
      request.loggedInUser.id !== parseInt(ownerId)) {
      res.status(403).send({
        message: 'You cannot delete someone else\'s document',
      });
      return false;
    }
    return true;
  }

  /**
   * @description Validates document ID for retrieval
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {any} docId Id of the document to be retrieved
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static docIdValid(request, res, docId) {
    if (!validator.isNumeric(docId)) {
      res.status(400).send({
        message: 'Document Id must be an integer',
      });
      return false;
    }
    return true;
  }

  /**
   * @description Filters Search Result 
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {object} doc the returned document
   * @returns {boolean} false
   * @memberof Utils
   */
  static filter(request, res, doc) {
    let count = 0;
    const newArr = [];
    while (count < doc.length) {
      const allowed = [doc[count].dataValues.User.dataValues.roleId, 1, 2];
      if (!((doc[count].dataValues.access === 'Private'
      && doc[count].dataValues.userId !== request.loggedInUser.id) ||
      (doc[count].dataValues.access === 'Role'
      && allowed.includes(request.loggedInUser.roleId)
      === false))) {
        delete doc[count].dataValues.User;
        newArr.push(doc[count]);
      }
      count += 1;
    }
    if (newArr.length === 0) {
      res.status(404).send({ message: 'No Document Found' });
      return false;
    }
    res.status(200).send(newArr);
    return false;
  }

  /**
   * @description Paginates Result 
   * @static
   * @param {object} request Client's request
   * @param {object} res Server Response
   * @param {object} object the returned document or user
   * @memberof Utils
   */
  static paginate(request, res, object) {
    const totalCount = object.length;
    let pageCount = Math.round(totalCount / (request.query.limit || 10));
    pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
    const page = Math.round((request.query.offset || 0) /
    (request.query.limit || 10)) + 1;
    res.status(200).send({ object,
      metaData: {
        page,
        pageCount,
        count: object.length,
        totalCount,
      }
    });
  }
}

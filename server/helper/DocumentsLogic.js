import validator from 'validator';

/**
 * @description Contains all Document Related Logic
 * @export
 * @class Utils
 */
export default class DocumentsLogic {
  /**
   * @description checks if Title exists
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @param {object} document The returned document
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static titleExist(request, response, document) {
    if (document) {
      response.status(400).send({
        message: 'Title already exists',
      });
      return true;
    }
    return false;
  }

  /**
   * @description adds more properties to the query
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @param {integer} limit Number of rows to be returned
   * @param {integer} offset Number of rows to be skipped
   * @param {object} property query property
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static listQuery(request, response, limit, offset, property) {
    if (((limit && !(validator.isNumeric(limit)))
      && (offset && !(validator.isNumeric(offset))))
      || ((limit && limit <= 0) && (offset && offset < 0))) {
      response.status(400).send({
        message: 'Invalid Limit and Offset',
      });
      return false;
    } else if ((limit && !(validator.isNumeric(limit))) ||
    (limit && limit <= 0)) {
      response.status(400).send({
        message: 'Invalid Limit',
      });
      return false;
    } else if ((offset && !(validator.isNumeric(offset))) ||
    (offset && offset < 0)) {
      response.status(400).send({
        message: 'Invalid Offset',
      });
      return false;
    }
    if (request.loggedInUser.roleId !== 3) {
      property.limit = limit || 10;
      property.offset = offset || 0;
    }
    response.property = property;
    return true;
  }

  /**
   * @description Checks if document exists
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @param {object} document the returned document
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isDocument(request, response, document) {
    if (!document) {
      response.status(404).send({
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
   * @param {object} response Server Response
   * @param {object} document the returned document
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isAllowed(request, response, document) {
    const allowed = [document.User.roleId, 1, 2];
    if ((document.access === 'Private' &&
      document.userId !== request.loggedInUser.id) ||
    (document.access === 'Role' && allowed.includes(request.loggedInUser.roleId)
    === false)) {
      response.status(403).send({
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
   * @param {object} response Server Response
   * @param {integer} ownerId id of the document owner
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static allowUpdate(request, response, ownerId) {
    if (request.loggedInUser.roleId !== 1 &&
      request.loggedInUser.id !== parseInt(ownerId)) {
      response.status(403).send({
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
   * @param {object} response Server Response
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static isValidParams(request, response) {
    if (!request.body.title && validator.isEmpty(request.body.title)) {
      response.status(400).send({
        message: 'Title is Required',
      });
      return false;
    }
    if (!request.body.content && validator.isEmpty(request.body.content)) {
      response.status(400).send({
        message: 'Content is Required',
      });
      return false;
    }
    if (!request.body.access && validator.isEmpty(request.body.access)) {
      response.status(400).send({
        message: 'Access is Required',
      });
      return false;
    }
    if (!(['Public', 'Private', 'Role'].includes(request.body.access))) {
      response.status(400).send({
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
   * @param {object} response Server Response
   * @param {object} error server error
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static validationError(request, response, error) {
    if (error.toString() ===
      'SequelizeUniqueConstraintError: Validation error') {
      response.status(400).send({
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
   * @param {object} response Server Response
   * @param {integer} ownerId id of the document owner
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static allowDelete(request, response, ownerId) {
    if (request.loggedInUser.roleId !== 1 &&
      request.loggedInUser.id !== parseInt(ownerId)) {
      response.status(403).send({
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
   * @param {object} response Server Response
   * @param {any} documentId Id of the document to be retrieved
   * @returns {boolean} true or false
   * @memberof Utils
   */
  static documentIdValid(request, response, documentId) {
    if (!validator.isNumeric(documentId)) {
      response.status(400).send({
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
   * @param {object} response Server Response
   * @param {object} document the returned document
   * @returns {boolean} false
   * @memberof Utils
   */
  static filter(request, response, document) {
    let count = 0;
    const newArr = [];
    while (count < document.length) {
      const allowed = [document[count].dataValues.User.dataValues.roleId, 1, 2];
      if (!((document[count].dataValues.access === 'Private'
      && document[count].dataValues.userId !== request.loggedInUser.id
      && request.loggedInUser.roleId === 3) ||
      (document[count].dataValues.access === 'Role'
      && allowed.includes(request.loggedInUser.roleId)
      === false))) {
        delete document[count].dataValues.User;
        newArr.push(document[count]);
      }
      count += 1;
    }
    if (newArr.length === 0) {
      response.status(404).send({ message: 'No Document Found' });
      return false;
    }
    const newArray = [];
    if (newArr.length - (request.query.offset || 0) < request.query.limit) {
      request.query.limit = newArr.length - (request.query.offset || 0);
    }
    if (request.query.offset) {
      let counter = parseInt(request.query.offset);
      while (counter <= ((parseInt(request.query.limit) +
        (parseInt(request.query.offset) - 1)) || 10)) {
        newArray.push(newArr[counter]);
        counter += 1;
      }
    } else {
      let counter = 0;
      while (counter < (parseInt(request.query.limit) || 10)) {
        newArray.push(newArr[counter]);
        counter += 1;
      }
    }
    response.document = newArray;
    return false;
  }

  /**
   * @description Paginates Result 
   * @static
   * @param {object} request Client's request
   * @param {object} response Server Response
   * @param {object} object the returned document or user
   * @memberof Utils
   */
  static paginate(request, response, object) {
    const totalCount = object.length;
    let pageCount = Math.round(totalCount / (request.query.limit || 10));
    pageCount = (pageCount < 1 && totalCount > 0) ? 1 : pageCount;
    const page = Math.round((request.query.offset || 0) /
    (request.query.limit || 10)) + 1;
    response.status(200).send({ object,
      metaData: {
        page,
        pageCount,
        count: object.length,
        totalCount,
      }
    });
  }
}

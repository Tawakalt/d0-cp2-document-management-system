import request from 'supertest';
import { expect } from 'chai';
import app from '../../build/server';
import jwtoken from '../../server/helper/jwt';

const dotenv = require('dotenv'),
  bcrypt = require('bcrypt');

dotenv.config();

const User = require('../../server/models').User;
const Role = require('../../server/models').Role;
const Document = require('../../server/models').Document;

const superToken = jwtoken.sign(1, process.env.EMAIL, 1);
const userToken = jwtoken.sign(2, process.env.USER_EMAIL, 3);
const saltRounds = 10;

describe('Documents Endpoints', () => {
  beforeEach((done) => {
    Document.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    })
      .then((err) => {
        if (!err) {
          User.destroy({
            where: {},
            truncate: true,
            cascade: true,
            restartIdentity: true
          })
            .then((err) => {
              if (!err) {
                Role.destroy({
                  where: {},
                  truncate: true,
                  cascade: true,
                  restartIdentity: true
                })
                  .then((err) => {
                    if (!err) {
                      Role.bulkCreate([
                        { role: 'Super Adminnn' },
                        { role: 'Admin' },
                        { role: 'User' }
                      ]).then(() => {
                        done();
                      });
                    }
                  });
              }
            });
        }
      });
  });

  describe('Create Documents Endpoint', () => {
    beforeEach((done) => {
      User.create(
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        }
      ).then(() => {
        done();
      });
    });
    it('should not create a document without title', (done) => {
      request(app)
        .post('/api/v1/documents/')
        .send({
          title: '',
          content: 'super',
          access: 'Public',
          userId: 1
        })
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Title is Required');
          done();
        });
    });
    it('should not create a document without content', (done) => {
      request(app)
        .post('/api/v1/documents/')
        .send({
          title: 'TITLE',
          content: '',
          access: 'Public',
          userId: 1
        })
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Content is Required');
          done();
        });
    });
    it('should not create a document without access type', (done) => {
      request(app)
        .post('/api/v1/documents/')
        .send({
          title: 'TITLE',
          content: 'CONTENT',
          access: '',
          userId: 1
        })
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Access is Required');
          done();
        });
    });
    it('should not create a document with an invalid access type', (done) => {
      request(app)
        .post('/api/v1/documents/')
        .send({
          title: 'TITLE',
          content: 'CONTENT',
          access: 'access',
          userId: 1
        })
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid Access Type');
          done();
        });
    });
    it('should successfully create a new document', (done) => {
      request(app)
        .post('/api/v1/documents/')
        .send({
          title: 'SUPER',
          content: 'super',
          access: 'Public',
          userId: 1
        })
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(201);
          expect(response.body.message).to.equal(
            'Document successfully created');
          expect(response.body.createdDocument.title).to.equal('SUPER');
          expect(response.body.createdDocument.content).to.equal('super');
          expect(response.body.createdDocument.access).to.equal('Public');
          expect(response.body.createdDocument.userId).to.equal(1);
          done();
        });
    });
    it('should not create a document with a title that exists', (done) => {
      Document.create(
        { title: 'SUPER',
          content: 'content',
          access: 'Public',
          userId: 1
        }
      );
      request(app)
        .post('/api/v1/documents/')
        .send({
          title: 'SUPER',
          content: 'super',
          access: 'Public',
          userId: 1
        })
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Title already exists');
          done();
        });
    });
  });

  describe('Get Documents Endpoint', () => {
    beforeEach((done) => {
      User.bulkCreate([
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        },
        { email: 'kay@y.com',
          password: bcrypt.hashSync('kay', saltRounds),
          roleId: 1
        }
      ]);
      done();
    });
    it('should display the right message when no document is found', (done) => {
      request(app)
        .get('/api/v1/documents/')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.message).to.equal(
            'No Document has been created');
          done();
        });
    });
    it('should successfully get all documents for an admin', (done) => {
      Document.create(
        { title: 'Ooooo',
          content: 'o o o',
          access: 'Role',
          userId: 1
        }
      );
      request(app)
        .get('/api/v1/documents/')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.object[0].title).to.equal('Ooooo');
          expect(response.body.object[0].content).to.equal('o o o');
          expect(response.body.object[0].access).to.equal('Role');
          expect(response.body.object[0].userId).to.equal(1);
          expect(response.body.metaData.page).to.equal(1);
          expect(response.body.metaData.pageCount).to.equal(1);
          expect(response.body.metaData.count).to.equal(1);
          expect(response.body.metaData.totalCount).to.equal(1);
          done();
        });
    });
    it('should successfully get all documents a user has access to', (done) => {
      Document.bulkCreate([
        { title: 'Ooooo',
          content: 'o o o',
          access: 'Role',
          userId: 1
        },
        { title: 'okkkkkkk',
          content: 'super',
          access: 'Public',
          userId: 1
        }
      ]);
      request(app)
        .get('/api/v1/documents/')
        .set('Authorization', `${userToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.object[0].title).to.equal('okkkkkkk');
          expect(response.body.object[0].content).to.equal('super');
          expect(response.body.object[0].access).to.equal('Public');
          expect(response.body.object[0].userId).to.equal(1);
          expect(response.body.metaData.page).to.equal(1);
          expect(response.body.metaData.pageCount).to.equal(1);
          expect(response.body.metaData.count).to.equal(1);
          expect(response.body.metaData.totalCount).to.equal(1);
          done();
        });
    });
    it('should not allow limit and offset as alphabets', (done) => {
      Document.create(
        { title: 'SUPER',
          content: 'super',
          access: 'Public',
          userId: 1
        }
      );
      request(app)
        .get('/api/v1/documents?limit=a&offset=b')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid Limit and Offset');
          done();
        });
    });
    it('should not allow limit as an alphabet', (done) => {
      Document.create(
        { title: 'SUPER',
          content: 'super',
          access: 'Public',
          userId: 1
        }
      );
      request(app)
        .get('/api/v1/documents?limit=a&offset=0')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid Limit');
          done();
        });
    });
    it('should not allow offset as an alphabet', (done) => {
      Document.create(
        { title: 'SUPER',
          content: 'super',
          access: 'Public',
          userId: 1
        }
      );
      request(app)
        .get('/api/v1/documents?limit=1&offset=a')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid Offset');
          done();
        });
    });
  });

  describe('Retrieve Document Endpoint', () => {
    beforeEach((done) => {
      User.create(
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        }
      ).then(() => {
        Document.create(
          { title: 'SUPERR',
            content: 'super',
            access: 'Private',
            userId: 1
          });
        done();
      });
    });
    it('should return a 404 error if document not found', (done) => {
      request(app)
        .get('/api/v1/documents/10')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('Document Not Found');
          done();
        });
    });
    it('should not allow an authorized user', (done) => {
      request(app)
        .get('/api/v1/documents/1')
        .set('Authorization', `${userToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.message).to.equal(
            'You are not authorized to view this document');
          done();
        });
    });
    it('should successfuly return the document found for an authorized user',
      (done) => {
        request(app)
          .get('/api/v1/documents/1')
          .set('Authorization', `${superToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.id).to.equal(1);
            expect(response.body.title).to.equal('SUPERR');
            expect(response.body.content).to.equal('super');
            expect(response.body.access).to.equal('Private');
            expect(response.body.userId).to.equal(1);
            done();
          });
      });
    it('should not allow an invalid document id', (done) => {
      request(app)
        .get('/api/v1/documents/aaa')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal(
            'Document Id must be an integer');
          done();
        });
    });
  });

  describe('Update Document Endpoint', () => {
    beforeEach((done) => {
      User.create(
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        }
      ).then(() => {
        Document.bulkCreate([
          { title: 'SUPER',
            content: 'super',
            access: 'Private',
            userId: 1
          },
          { title: 'SUPER2',
            content: 'super',
            access: 'Private',
            userId: 1
          }
        ]);
        done();
      });
    });
    it('should return a 404 error if document not found', (done) => {
      request(app)
        .put('/api/v1/documents/10')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: 'SUPER!!!',
          content: 'super',
          access: 'Public',
          userId: 1
        })
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('Document Not Found');
          done();
        });
    });
    it('should not allow a user to update someone else\'s document', (done) => {
      request(app)
        .put('/api/v1/documents/1')
        .set('Authorization', `${userToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: 'TEST3',
          content: 'test3',
          access: 'Public',
          userId: '1'
        })
        .end((err, response) => {
          expect(response.status).to.equal(403);
          expect(response.body.message).to.equal(
            'You cannot update someone else\'s document');
          done();
        });
    });
    it('should not allow an empty title', (done) => {
      request(app)
        .put('/api/v1/documents/1')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: '',
          content: 'test3',
          access: 'Public',
          userId: '1'
        })
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Title is Required');
          done();
        });
    });
    it('should not allow an empty content', (done) => {
      request(app)
        .put('/api/v1/documents/1')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: 'Title',
          content: '',
          access: 'Public',
          userId: '1'
        })
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Content is Required');
          done();
        });
    });
    it('should not allow an invalid access type', (done) => {
      request(app)
        .put('/api/v1/documents/1')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: 'Title',
          content: 'Content',
          access: 'access',
          userId: '1'
        })
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Invalid Access Type');
          done();
        });
    });
    it('should not allow an empty access type', (done) => {
      request(app)
        .put('/api/v1/documents/1')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: 'TEST3',
          content: 'test3',
          access: '',
          userId: '1'
        })
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal('Access is Required');
          done();
        });
    });
    it('should not allow a title that already exists', (done) => {
      request(app)
        .put('/api/v1/documents/1')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: 'SUPER2',
          content: 'super2',
          access: 'Public',
          userId: '1'
        })
        .end((err, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal(
            'Your Edited Title already exists!!!');
          done();
        });
    });
    it('should successfully update document\'s details', (done) => {
      request(app)
        .put('/api/v1/documents/1')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .send({
          title: 'SUPER3',
          content: 'super2',
          access: 'Public',
          userId: '1'
        })
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.message).to.equal('Update Successful');
          expect(response.body.updatedDetails.title).to.equal('SUPER3');
          expect(response.body.updatedDetails.content).to.equal('super2');
          expect(response.body.updatedDetails.access).to.equal('Public');
          expect(response.body.updatedDetails.userId).to.equal(1);
          done();
        });
    });
  });

  describe('Delete Documents Endpoint', () => {
    beforeEach((done) => {
      User.create(
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        }
      ).then(() => {
        Document.create(
          { title: 'SUPERR',
            content: 'super',
            access: 'Private',
            userId: 1
          });
        done();
      });
    });
    it('should return a 404 error if document not found', (done) => {
      request(app)
        .delete('/api/v1/documents/10')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('Document Not Found');
          done();
        });
    });
    it('should not allow a non admin to delete someone else\'s document',
      (done) => {
        request(app)
          .delete('/api/v1/documents/1')
          .set('Authorization', `${userToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(403);
            expect(response.body.message).to.equal(
              'You cannot delete someone else\'s document');
            done();
          });
      });
    it('should successfully delete a document', (done) => {
      request(app)
        .delete('/api/v1/documents/1')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body.message).to.equal(
            'Document successfully deleted');
          done();
        });
    });
  });
});

import request from 'supertest';
import { expect } from 'chai';
import localStorage from 'local-storage';
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
    localStorage.clear();
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
      localStorage.clear();
      User.create(
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        }
      ).then(() => {
        done();
      });
    });
    it('it should successfully create a new document', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .post('/api/v1/documents/')
        .send({
          title: 'SUPER',
          content: 'super',
          access: 'Public',
          userId: 1
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal('Document successfully created');
          }
          done();
        });
    });
  });

  describe('Get Documents Endpoint', () => {
    beforeEach((done) => {
      localStorage.clear();
      User.create(
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        }
      );
      done();
    });
    it('should display the right message when no document is found', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/documents/')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('No Document has been created');
          }
          done();
        });
    });
    it('should successfully get all documents', (done) => {
      localStorage.set('token', superToken);
      Document.create(
        { title: 'SUPER',
          content: 'super',
          access: 'Public',
          userId: 1
        }
      );
      request(app)
        .get('/api/v1/documents/')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
  });

  describe('Retrieve Document Endpoint', () => {
    beforeEach((done) => {
      localStorage.clear();
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
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/documents/10')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Document Not Found');
          }
          done();
        });
    });
    it('should not authorize an authorized user', (done) => {
      localStorage.set('token', userToken);
      request(app)
        .get('/api/v1/documents/1')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal(
              'You are not authorized to view this document');
          }
          done();
        });
    });
    it('should successfuly return for an authorized user', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/documents/1')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
  });

  describe('Update Document Endpoint', () => {
    beforeEach((done) => {
      localStorage.clear();
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
      localStorage.set('token', superToken);
      request(app)
        .put('/api/v1/documents/10')
        .send({
          title: 'SUPER!!!',
          content: 'super',
          access: 'Public',
          userId: 1
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Document Not Found');
          }
          done();
        });
    });
    it('should not allow someone else', (done) => {
      localStorage.set('token', userToken);
      request(app)
        .put('/api/v1/documents/1')
        .send({
          title: 'TEST3',
          content: 'test3',
          access: 'Public',
          userId: '1'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal(
              'You cannot update someone else\'s document');
          }
          done();
        });
    });
    it('should not allow invalid parameters', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .put('/api/v1/documents/1')
        .send({
          title: 'TEST3',
          content: 'test3',
          access: '',
          userId: '1'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Access is Required');
          }
          done();
        });
    });
    it('should not allow a title that already exists', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .put('/api/v1/documents/1')
        .send({
          title: 'SUPER2',
          content: 'super2',
          access: 'Public',
          userId: '1'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal(
              'Your Edited Title already exists!!!');
          }
          done();
        });
    });
    it('should successfully update document\'s details', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .put('/api/v1/documents/1')
        .send({
          title: 'SUPER3',
          content: 'super2',
          access: 'Public',
          userId: '1'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Update Successful');
          }
          done();
        });
    });
  });

  describe('Delete Documents Endpoint', () => {
    beforeEach((done) => {
      localStorage.clear();
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
      localStorage.set('token', superToken);
      request(app)
        .delete('/api/v1/documents/10')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Document Not Found');
          }
          done();
        });
    });
    it('should not allow someone else', (done) => {
      localStorage.set('token', userToken);
      request(app)
        .delete('/api/v1/documents/1')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal(
              'You cannot delete someone else\'s document');
          }
          done();
        });
    });
    it('should successfully delete a user', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .delete('/api/v1/documents/1')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Document successfully deleted');
          }
          done();
        });
    });
  });
});

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

describe('Search Endpoints', () => {
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

  describe('Search Users Endpoint', () => {
    beforeEach((done) => {
      localStorage.clear();
      User.create(
        { email: 'tee@y.com',
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        }
      );
      done();
    });
    it('should not allow an invalid email', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/search/users?q=a@y')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid Email!!!');
          }
          done();
        });
    });
    it('should display the right message when no user is found', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/search/users?q=a@y.com')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('User Not Found');
          }
          done();
        });
    });
    it('should successfully return the user', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/search/users?q=tee@y.com')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
  });

  describe('Search Documents Endpoint', () => {
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
    it('should return 404 when no document is found', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/search/documents?q=title')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
          }
          done();
        });
    });
    it('should not allow an unauthorized user', (done) => {
      localStorage.set('token', userToken);
      request(app)
        .get('/api/v1/search/documents?q=SUPERR')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(403);
            expect(res.body.message).to.equal(
              'You are not authorized to view this document');
          }
          done();
        });
    });
    it('should successfully return the document', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/search/documents?q=SUPERR')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
  });
});

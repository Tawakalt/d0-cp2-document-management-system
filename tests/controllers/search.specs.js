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
const saltRounds = 10;

describe('Search Endpoints', () => {
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

  describe('Search Users Endpoint', () => {
    beforeEach((done) => {
      User.create(
        { email: 'tee@y.com',
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        }
      );
      done();
    });
    it('should display the right message when no user is found', (done) => {
      request(app)
        .get('/api/v1/search/users?q=a@y.com')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('No User Found');
          done();
        });
    });
    it('should successfully return the user(s) found', (done) => {
      request(app)
        .get('/api/v1/search/users?q=t')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(200);
          expect(response.body[0].email).to.equal('tee@y.com');
          expect(response.body[0].roleId).to.equal(1);
          done();
        });
    });
  });

  describe('Search Documents Endpoint', () => {
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
    it('should return 404 when no document is found', (done) => {
      request(app)
        .get('/api/v1/search/documents?q=title')
        .set('Authorization', `${superToken}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          expect(response.status).to.equal(404);
          expect(response.body.message).to.equal('No Document Found');
          done();
        });
    });
    it('should successfully return the document found',
      (done) => {
        request(app)
          .get('/api/v1/search/documents?q=SU')
          .set('Authorization', `${superToken}`)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .end((err, response) => {
            expect(response.status).to.equal(200);
            expect(response.body.object[0].title).to.equal('SUPERR');
            expect(response.body.object[0].content).to.equal('super');
            expect(response.body.object[0].access).to.equal('Private');
            expect(response.body.object[0].userId).to.equal(1);
            done();
          });
      });
  });
});

import request from 'supertest';
import { expect } from 'chai';
import app from '../../build/server';
import jwtoken from '../../server/helper/jwt';

const dotenv = require('dotenv'),
  bcrypt = require('bcrypt');

dotenv.config();

const User = require('../../server/models').User;
const Role = require('../../server/models').Role;

const saltRounds = 10;
const token = jwtoken.sign(1, process.env.EMAIL, 1);

describe('Role Endpoints', () => {
  beforeEach((done) => {
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
                  { role: 'Super Admin' },
                  { role: 'Admin' },
                  { role: 'User' }
                ]).then(() => {
                  done();
                });
              }
            });
        }
      });
  });
  describe('Create Roles Endpoint', () => {
    it('should reject the request when not signed in', (done) => {
      request(app)
        .post('/api/v1/roles/')
        .send({
          role: 'Editor'
        })
        .end((err, response) => {
          if (!err) {
            expect(response.status).to.equal(401);
            expect(response.body.message).to.equal('You are not signed in');
          }
          done();
        });
    });
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
    it('should not allow an invalid role', (done) => {
      request(app)
        .post('/api/v1/roles/')
        .send({
          role: ''
        })
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          if (!err) {
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal('Invalid Role');
          }
          done();
        });
    });
    it('should successfully create a new role', (done) => {
      request(app)
        .post('/api/v1/roles/')
        .send({
          role: 'Editor'
        })
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          if (!err) {
            expect(response.status).to.equal(201);
            expect(response.body.message).to.equal('Role successfully created');
            expect(response.body.createdRole.role).to.equal('Editor');
          }
          done();
        });
    });
  });

  describe('Get Roles Endpoint', () => {
    it('should reject the request when not signed in', (done) => {
      request(app)
        .get('/api/v1/roles/')
        .end((err, response) => {
          if (!err) {
            expect(response.status).to.equal(401);
            expect(response.body.message).to.equal('You are not signed in');
          }
          done();
        });
    });
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
    it('should successfully get all roles', (done) => {
      request(app)
        .get('/api/v1/roles/')
        .set('Authorization', `${token}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .end((err, response) => {
          if (!err) {
            expect(response.status).to.equal(200);
            expect(response.body[0].role).to.equal('Super Admin');
            expect(response.body[1].role).to.equal('Admin');
            expect(response.body[2].role).to.equal('User');
          }
          done();
        });
    });
  });
});

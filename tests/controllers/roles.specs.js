import request from 'supertest';
import localStorage from 'local-storage';
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
    localStorage.clear();
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
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('You are not signed in');
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
      localStorage.set('token', token);
      request(app)
        .post('/api/v1/roles/')
        .send({
          role: ''
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid Role');
          }
          done();
        });
    });
    it('should successfully create a new role', (done) => {
      localStorage.set('token', token);
      request(app)
        .post('/api/v1/roles/')
        .send({
          role: 'Editor'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal('Role successfully created');
            expect(res.body.role.role).to.equal('Editor');
          }
          done();
        });
    });
  });

  describe('Get Roles Endpoint', () => {
    it('should reject the request when not signed in', (done) => {
      request(app)
        .get('/api/v1/roles/')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('You are not signed in');
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
      localStorage.set('token', token);
      request(app)
        .get('/api/v1/roles/')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body[0].role).to.equal('Super Admin');
            expect(res.body[1].role).to.equal('Admin');
            expect(res.body[2].role).to.equal('User');
          }
          done();
        });
    });
  });
});

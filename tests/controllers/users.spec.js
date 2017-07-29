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
const adminToken = jwtoken.sign(3, process.env.ADMIN_EMAIL, 2);
const saltRounds = 10;

describe('User Endpoints', () => {
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
                ]).then((err) => {
                  if (!err) {
                    // 
                  }
                  done();
                });
              }
            });
        }
      });
  });

  describe('Create User Endpoint', () => {
    it('it should successfully create a new user', (done) => {
      request(app)
        .post('/api/v1/users/')
        .send({
          email: 'kenny@y.com',
          password: 'kenny',
          role: 3
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal('User successfully created');
          }
          done();
        });
    });

    it('it should not create a user with an invalid email', (done) => {
      request(app)
        .post('/api/v1/users/')
        .send({
          email: 'you@',
          password: 'you',
          role: 3
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid Email');
          }
          done();
        });
    });
  });

  describe('Get Users Endpoint', () => {
    beforeEach((done) => {
      localStorage.clear();
      done();
      // User.create(
      //   { email: process.env.EMAIL,
      //     password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
      //     roleId: 1
      //   }
      // ).then(() => {
      //   done();
      // });
    });
    it('should successfully get all roles with an authorized user', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/users/')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
    it('should not authorize a user', (done) => {
      localStorage.set('token', userToken);
      request(app)
        .get('/api/v1/users/')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal(
              'You do not have access to this request!!!');
          }
          done();
        });
    });
    it('should sussessfully paginate', (done) => {
      localStorage.set('token', adminToken);
      request(app)
        .get('/api/v1/users?limit=1&offset=0')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
  });

  describe('Retrieve User Endpoint', () => {
    beforeEach((done) => {
      localStorage.clear();
      done();
      User.create(
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        }
      ).then(() => {
        done();
      });
    });
    it('should return a 404 error if user not found', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/users/10')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('User Not Found');
          }
          done();
        });
    });
    it('should successfuly return the user if found', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/users/1')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
  });

  describe('Update User Endpoint', () => {
    beforeEach((done) => {
      localStorage.clear();
      User.bulkCreate([
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        },
        { email: 'kenny@y.com',
          password: 'kenny',
          roleId: 3
        },
      ]).then(() => {
        done();
      });
    });
    it('should return a 404 error if user not found', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .put('/api/v1/users/10')
        .send({
          roleId: '3'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('User Not Found');
          }
          done();
        });
    });
    it('should only allow a super admin to update other users role', (done) => {
      localStorage.clear();
      localStorage.set('token', superToken);
      request(app)
        .put('/api/v1/users/2')
        .send({
          email: 'kenny2@y.com',
          password: 'kenny2',
          roleId: '3'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            let message = 'You only have acess to change a user\'s role, ';
            message += 'not their email and definitely not their password!!!';
            expect(res.body.message).to.equal(message);
          }
          done();
        });
    });
    it('should not allow invalid parameters from users', (done) => {
      localStorage.set('token', userToken);
      request(app)
        .put('/api/v1/users/2')
        .send({
          email: 'kenny2@',
          password: 'kenny'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid Email!!!');
          }
          done();
        });
    });
    it('should successfully update the user\'s details with the initial values',
      (done) => {
        localStorage.set('token', userToken);
        request(app)
          .put('/api/v1/users/2')
          .send({
            email: 'kenny@y.com',
            password: 'kenny'
          })
          .end((err, res) => {
            if (!err) {
              expect(res.status).to.equal(200);
            }
            done();
          });
      });
    it('should successfully update the user\'s details', (done) => {
      localStorage.set('token', userToken);
      request(app)
        .put('/api/v1/users/2')
        .send({
          email: 'kenny2@y.com',
          password: 'kenny2'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
    it('should allow a super admin to update a users role with what was there',
      (done) => {
        localStorage.set('token', superToken);
        request(app)
          .put('/api/v1/users/2')
          .send({
            roleId: '3'
          })
          .end((err, res) => {
            if (!err) {
              expect(res.status).to.equal(200);
            }
            done();
          });
      });
    it('should allow a super admin to update a users role', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .put('/api/v1/users/2')
        .send({
          roleId: '1'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
    it('should not allow a role that doesn\'t exist', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .put('/api/v1/users/2')
        .send({
          roleId: '20'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal(
              'There is no role with that RoleId!!!');
          }
          done();
        });
    });
  });

  describe('Delete Users Endpoint', () => {
    beforeEach((done) => {
      localStorage.clear();
      User.bulkCreate([
        { email: process.env.EMAIL,
          password: bcrypt.hashSync(process.env.PASSWORD, saltRounds),
          roleId: 1
        },
        { email: 'kenny@y.com',
          password: 'kenny',
          roleId: 3
        },
      ]).then(() => {
        done();
      });
    });
    it('should return a 404 error if user not found', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .delete('/api/v1/users/10')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('User Not Found');
          }
          done();
        });
    });
    it('should successfully delete a user', (done) => {
      localStorage.set('token', superToken);
      request(app)
        .delete('/api/v1/users/2')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('User successfully deleted');
          }
          done();
        });
    });
  });

  describe('Login Endpoint', () => {
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
    it('should return a 404 error if user not found', (done) => {
      request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'a@y.com',
          password: 'a'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('Kindly Sign Up First');
          }
          done();
        });
    });
    it('should not log user in with wrong password', (done) => {
      request(app)
        .post('/api/v1/users/login')
        .send({
          email: process.env.EMAIL,
          password: 'a'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Wrong Password');
          }
          done();
        });
    });
    it('should should successfully log user in', (done) => {
      request(app)
        .post('/api/v1/users/login')
        .send({
          email: process.env.EMAIL,
          password: process.env.PASSWORD
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal('login successful');
          }
          done();
        });
    });
  });

  describe('Logout Endpoint', () => {
    it('should successfully log user out', (done) => {
      localStorage.clear();
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/users/logout')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('User sussefully logged out');
          }
          done();
        });
    });
  });

  describe('Retrieve all docs of a user\'s Endpoint', () => {
    it('should return the appropriate message when no document is found for',
      (done) => {
        localStorage.clear();
        localStorage.set('token', superToken);
        request(app)
          .get('/api/v1/users/1/documents')
          .end((err, res) => {
            if (!err) {
              expect(res.status).to.equal(200);
              expect(res.body.message).to.equal(
                'This User has not created any Document');
            }
            done();
          });
      });

    it('should sreturn documents found', (done) => {
      Document.create(
        { title: 'TEST2',
          content: 'Testing2',
          access: 'Public',
          userId: 1
        }
      );
      localStorage.clear();
      localStorage.set('token', superToken);
      request(app)
        .get('/api/v1/users/1/documents')
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });
  });
});

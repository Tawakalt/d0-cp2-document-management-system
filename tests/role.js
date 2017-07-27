import request from 'supertest';
import { expect } from 'chai';

import app from '../server';

describe('API Tests', () => {
  it('should return version number', (done) => {
    request(app)
      .post('/api/v1/users/')
      .send({
        email: 'tawakaltttt@y.com',
        password: 'tawakaltttt',
        role: 3
      })
      .end((err, res) => {
        if (!err) {
          expect(res.status).to.equal(201);
          expect(res.body).to.be.an('object');
        }
        done();
      });
  });
});

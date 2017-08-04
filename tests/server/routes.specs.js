import request from 'supertest';
import { expect } from 'chai';
import app from '../../build/server';

describe('Routes', () => {
  describe('Invalid Post request', () => {
    it('should display the right message for an invalid Post request',
      (done) => {
        request(app)
          .post('/api/roles/')
          .send({
            role: 'Editor'
          })
          .end((err, res) => {
            if (!err) {
              expect(res.status).to.equal(404);
              expect(res.body.message).to.equal('INVALID ROUTE!!!.');
            }
            done();
          });
      });
  });
  describe('Invalid Get request', () => {
    it('should display the right message for an invalid Get request',
      (done) => {
        request(app)
          .get('/api/roles/')
          .end((err, res) => {
            if (!err) {
              expect(res.status).to.equal(404);
              expect(res.body.message).to.equal('INVALID ROUTE!!!.');
            }
            done();
          });
      });
  });
  describe('Invalid Put request', () => {
    it('should display the right message for an invalid Put request',
      (done) => {
        request(app)
          .put('/api/roles/')
          .send({
            role: 'Editor'
          })
          .end((err, res) => {
            if (!err) {
              expect(res.status).to.equal(404);
              expect(res.body.message).to.equal('INVALID ROUTE!!!.');
            }
            done();
          });
      });
  });
  describe('Invalid Delete request', () => {
    it('should display the right message for an invalid Delete request',
      (done) => {
        request(app)
          .delete('/api/roles/')
          .end((err, res) => {
            if (!err) {
              expect(res.status).to.equal(404);
              expect(res.body.message).to.equal('INVALID ROUTE!!!.');
            }
            done();
          });
      });
  });
});

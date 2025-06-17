const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let threadId;
let replyId;

describe('Functional Tests', function () {

  it('POST /api/threads/test => create thread', function (done) {
    chai.request(server)
      .post('/api/threads/test')
      .send({
        text: 'Test thread',
        delete_password: 'pass'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });

  it('GET /api/threads/test => most recent 10 threads with 3 replies', function (done) {
    chai.request(server)
      .get('/api/threads/test')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], '_id');
        assert.property(res.body[0], 'text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'bumped_on');
        assert.property(res.body[0], 'replies');
        threadId = res.body[0]._id;
        done();
      });
  });

  it('POST /api/replies/test => create reply', function (done) {
    chai.request(server)
      .post('/api/replies/test')
      .send({
        thread_id: threadId,
        text: 'Test reply',
        delete_password: 'pass'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        done();
      });
  });

  it('GET /api/replies/test => single thread with all replies', function (done) {
    chai.request(server)
      .get('/api/replies/test')
      .query({ thread_id: threadId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'replies');
        assert.isArray(res.body.replies);
        replyId = res.body.replies[0]._id;
        done();
      });
  });

  it('PUT /api/threads/test => report thread', function (done) {
    chai.request(server)
      .put('/api/threads/test')
      .send({ report_id: threadId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  it('PUT /api/replies/test => report reply', function (done) {
    chai.request(server)
      .put('/api/replies/test')
      .send({ thread_id: threadId, reply_id: replyId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported');
        done();
      });
  });

  it('DELETE /api/replies/test => incorrect password', function (done) {
    chai.request(server)
      .delete('/api/replies/test')
      .send({ thread_id: threadId, reply_id: replyId, delete_password: 'wrong' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  it('DELETE /api/replies/test => correct password', function (done) {
    chai.request(server)
      .delete('/api/replies/test')
      .send({ thread_id: threadId, reply_id: replyId, delete_password: 'pass' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

  it('DELETE /api/threads/test => incorrect password', function (done) {
    chai.request(server)
      .delete('/api/threads/test')
      .send({ thread_id: threadId, delete_password: 'wrong' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      });
  });

  it('DELETE /api/threads/test => correct password', function (done) {
    chai.request(server)
      .delete('/api/threads/test')
      .send({ thread_id: threadId, delete_password: 'pass' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      });
  });

});


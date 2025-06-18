'use strict';

module.exports = function (app) {
  let threads = [];

  app.route('/api/threads/:board')
    .post((req, res) => {
      const { text, delete_password } = req.body;
      const board = req.params.board;
      const thread = {
        _id: Date.now().toString(),
        board,
        text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password,
        replies: []
      };
      threads.push(thread);
      res.redirect(`/b/${board}/`);
    })

    .get((req, res) => {
      const board = req

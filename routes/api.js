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
      const board = req.params.board;
      const boardThreads = threads
        .filter(t => t.board === board)
        .slice(-10)
        .map(thread => ({
          _id: thread._id,
          text: thread.text,
          created_on: thread.created_on,
          bumped_on: thread.bumped_on,
          replies: thread.replies
            .slice(-3)
            .map(r => ({
              _id: r._id,
              text: r.text,
              created_on: r.created_on
            }))
        }));
      res.json(boardThreads);
    })

    .delete((req, res) => {
      const { thread_id, delete_password } = req.body;
      const index = threads.findIndex(t => t._id === thread_id);
      if (index === -1) return res.send('thread not found');
      if (threads[index].delete_password !== delete_password) {
        return res.send('incorrect password');
      }
      threads.splice(index, 1);
      res.send('success');
    })

    .put((req, res) => {
  const { thread_id } = req.body;
  const id = String(thread_id); // asegura comparación como string
  const thread = threads.find(t => t._id === id);
  if (!thread) {
    return res.send('thread not found');
  }
  thread.reported = true;
  res.send('reported');
});

  app.route('/api/replies/:board')
    .post((req, res) => {
      const { thread_id, text, delete_password } = req.body;
      const thread = threads.find(t => t._id === thread_id);
      if (!thread) return res.send('thread not found');
      const reply = {
        _id: Date.now().toString(),
        text,
        created_on: new Date(),
        delete_password,
        reported: false
      };
      thread.replies.push(reply);
      thread.bumped_on = new Date();
      res.redirect(`/b/${req.params.board}/${thread_id}`);
    })

    .get((req, res) => {
      const thread = threads.find(t => t._id === req.query.thread_id);
      if (!thread) return res.send('thread not found');
      res.json({
        _id: thread._id,
        text: thread.text,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: thread.replies.map(r => ({
          _id: r._id,
          text: r.text,
          created_on: r.created_on
        }))
      });
    })

    .delete((req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      const thread = threads.find(t => t._id === thread_id);
      if (!thread) return res.send('thread not found');
      const reply = thread.replies.find(r => r._id === reply_id);
      if (!reply) return res.send('reply not found');
      if (reply.delete_password !== delete_password) {
        return res.send('incorrect password');
      }
      reply.text = '[deleted]';
      res.send('success');
    })

    .put((req, res) => {
      const { thread_id, reply_id } = req.body;
      const thread = threads.find(t => t._id === thread_id);
      if (!thread) return res.send('thread not found');
      const reply = thread.replies.find(r => r._id === reply_id);
      if (!reply) return res.send('reply not found');
      reply.reported = true;
      res.send('reported');
    });
};

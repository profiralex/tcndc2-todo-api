const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text,
  });
  todo
    .save()
    .then(data => {
      res.send(data);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
  Todo.find()
    .then(data => {
      res.send({
        todos: data,
      });
    })
    .catch(e => {
      res.status(500).send(e);
    });
});

app.listen(3000, () => {
  console.log('Started on port 3000');
});

module.exports = { app };

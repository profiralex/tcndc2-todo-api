const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const users = [
  {
    _id: userOneID,
    email: 'andrew@example.com',
    password: 'userOnePass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign({ _id: userOneID, access: 'auth' }, process.env.JWT_SECRET)
          .toString(),
      },
    ],
  },
  {
    _id: userTwoID,
    email: 'jen@example.com',
    password: 'userTwoPass',
    tokens: [
      {
        access: 'auth',
        token: jwt
          .sign({ _id: userTwoID, access: 'auth' }, process.env.JWT_SECRET)
          .toString(),
      },
    ],
  },
];

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneID,
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: new Date().getTime(),
    _creator: userTwoID,
  },
];

const populateTodos = async () => {
  await Todo.remove({});
  await Todo.insertMany(todos);
};

const populateUsers = async () => {
  await User.remove({});
  await new User(users[0]).save();
  await new User(users[1]).save();
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers,
};

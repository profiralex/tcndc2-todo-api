const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

const id = '5a85d779c3cc70099a991e061';
const userId = '5a8346088db7ff0868f71b0c';

// Todo.find({ _id: id }).then(todos => console.log('Todos', todos));
// Todo.findOne({ _id: id }).then(todo => console.log('Todo', todo));

// if (!ObjectID.isValid(id)) {
//   console.log('Id is not valid');
// }

// Todo.findById(id)
//   .then(todo => {
//     if (!todo) {
//       return console.log('Todo not found');
//     }
//
//     console.log('Todo', todo);
//   })
//   .catch(e => console.log(e));

User.findById(userId)
  .then(user => {
    if (!user) {
      return console.log('User not found');
    }

    console.log(user);
  })
  .catch(e => console.log(e));

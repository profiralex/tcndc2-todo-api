const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// Todo.remove({}).then(result => {
//   console.log(result);
// });

// Todo.findOneAndRemove();
// Todo.findByIdAndRemove();

Todo.findByIdAndRemove('5a8711957d707781da6a593a').then(doc => {
  console.log(doc);
});

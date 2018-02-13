const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) return console.log('Unable to connect to database.');
  console.log('Connected to database');

  const db = client.db('TodoApp');
  const todosCollection = db.collection('Todos');
  const usersCollection = db.collection('Users');

  // todosCollection
  //   .findOneAndUpdate(
  //     { text: 'Something to do7' },
  //     { $set: { completed: true } },
  //     { returnOriginal: false }
  //   )
  //   .then(res => {
  //     console.log(res);
  //   });

  usersCollection
    .findOneAndUpdate(
      { _id: new ObjectID('5a81e574e2c74f18c35cf637') },
      {
        $set: { name: 'Pigo' },
        $inc: { age: 1 },
      },
      { returnOriginal: false },
    )
    .then(res => {
      console.log(res);
    });
});

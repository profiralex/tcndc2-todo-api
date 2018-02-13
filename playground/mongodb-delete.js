const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) return console.log('Unable to connect to database.');
  console.log('Connected to database');

  const db = client.db('TodoApp');
  const todosCollection = db.collection('Todos');
  const usersCollection = db.collection('Users');

  // todosCollection.deleteMany({ text: 'Something to do5' }).then(res => {
  //   console.log(res);
  // });

  // todosCollection.deleteOne({ text: 'Something to do1' }).then(res => {
  //   console.log(res);
  // });

  // todosCollection.findOneAndDelete({ text: 'Something to do4' }).then(res => {
  //   console.log(res);
  // });

  // usersCollection.deleteMany({ name: 'Alexandr' }).then(res => {
  //   console.log(res);
  // });

  // usersCollection
  //   .deleteOne({ _id: new ObjectID('5a81e71df2747e18f9b5bc33') })
  //   .then(res => {
  //     console.log(res);
  //   });

  // usersCollection.findOneAndDelete({ name: 'Jane' }).then(res => {
  //   console.log(res);
  // });
});

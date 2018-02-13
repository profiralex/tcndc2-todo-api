const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) return console.log('Unable to connect to database.');
  console.log('Connected to database');

  // const db = client.db('TodoApp');
  // const todosCollection = db.collection('Todos');
  // todosCollection.find().count().then(count => {
  //   console.log(`${count} todos found`);
  // })
  // .catch(e => console.log(e))

  const db = client.db('TodoApp');

  const usersCollection = db.collection('Users');

  usersCollection
    .find({ name: 'Alexandr' })
    .toArray()
    .then(users => {
      console.log(JSON.stringify(users, undefined, 2));
    })
    .catch(e => console.log(e));
});

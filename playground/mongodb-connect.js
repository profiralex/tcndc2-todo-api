const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) return console.log('Unable to connect to database.');
  console.log('Connected to database');

  // const todosCollection = client.db('TodoApp').collection('Todos');
  // todosCollection.insertOne({
  //   text:"Something to do",
  //    completed: false
  //  }, (err, result) => {
  //   if (err) return console.log('Unable to insert todo', err);
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });
  //
  // const usersCollection = client.db('TodoApp').collection('Users');
  // usersCollection.insertOne({
  //   name:"Alexandr",
  //   age: 25,
  //   location: "Romania"
  //  }, (err, result) => {
  //   if (err) return console.log('Unable to insert user', err);
  //   console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
  // });

  client.close();
});

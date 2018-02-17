const { ObjectID } = require('mongodb');
const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const { Todo } = require('../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: new Date().getTime(),
  },
];

beforeEach(() => Todo.remove({}).then(() => Todo.insertMany(todos)));

describe('POST /todos', () => {
  it('should create a new todo', () => {
    const text = 'Test todo text';
    return request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
      })
      .then(_ => Todo.find({ text }))
      .then(todos => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
      });
  });

  it('should not create todo with invalid body data', () =>
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .then(_ => Todo.find({}))
      .then(todos => {
        expect(todos.length).toBe(2);
      }));
});

describe('GET /todos', () => {
  it('should get all todos', () =>
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      }));
});

describe('GET /todos:id', () => {
  it('should return todo', () =>
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      }));

  it('should return 404 for non existent id', () =>
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404));

  it('should return 404 for invalid id', () =>
    request(app)
      .get(`/todos/123`)
      .expect(404));
});

describe('DELETE /todos:id', () => {
  it('should remove a todo', () => {
    const hexId = todos[1]._id.toHexString();
    return request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .then(_ => Todo.findById(hexId))
      .then(todo => {
        expect(todo).toNotExist();
      });
  });

  it('should return 404 if todo not found', () => {
    const hexId = new ObjectID().toHexString();
    return request(app)
      .delete(`/todos/${hexId}`)
      .expect(404)
      .then(_ => Todo.find({}))
      .then(todos => {
        expect(todos.length).toBe(2);
      });
  });

  it('should return 404 if id is invalid', () =>
    request(app)
      .delete(`/todos/1234`)
      .expect(404)
      .then(_ => Todo.find({}))
      .then(todos => {
        expect(todos.length).toBe(2);
      }));
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', () => {
    const hexId = todos[0]._id.toHexString();
    const text = 'New updated text 1';

    return request(app)
      .patch(`/todos/${hexId}`)
      .send({ text, completed: true })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      });
  });

  it('should clear the completedAt when todo is not completed', () => {
    const hexId = todos[1]._id.toHexString();
    const text = 'New updated text 2';

    return request(app)
      .patch(`/todos/${hexId}`)
      .send({ text, completed: false })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      });
  });

  it('should return 404 if todo not found', () => {
    const hexId = new ObjectID().toHexString();
    return request(app)
      .patch(`/todos/${hexId}`)
      .expect(404);
  });

  it('should return 404 if id is invalid', () =>
    request(app)
      .patch(`/todos/1234`)
      .expect(404));
});

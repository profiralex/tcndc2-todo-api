const { ObjectID } = require('mongodb');
const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a new todo', async () => {
    const text = 'Test todo text';
    await request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
      });

    const todos = await Todo.find({ text });
    expect(todos.length).toBe(1);
    expect(todos[0].text).toBe(text);
  });

  it('should not create todo with invalid body data', async () => {
    await request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400);

    const todos = await Todo.find({});
    expect(todos.length).toBe(2);
  });
});

describe('GET /todos', () => {
  it('should get all todos', () =>
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(1);
      }));
});

describe('GET /todos:id', () => {
  it('should return todo', () =>
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      }));

  it('should not return todo created by other user', () =>
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404));

  it('should return 404 for non existent id', () =>
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404));

  it('should return 404 for invalid id', () =>
    request(app)
      .get(`/todos/123`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404));
});

describe('DELETE /todos:id', () => {
  it('should remove a todo', async () => {
    const hexId = todos[1]._id.toHexString();
    await request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      });

    const todo = await Todo.findById(hexId);
    expect(todo).toBeFalsy();
  });

  it('should not remove a todo created by other user', async () => {
    const hexId = todos[1]._id.toHexString();
    await request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404);

    const foundTodos = await Todo.find({});
    expect(foundTodos.length).toBe(2);
  });

  it('should return 404 if todo not found', async () => {
    const hexId = new ObjectID().toHexString();
    await request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404);

    const foundTodos = await Todo.find({});
    expect(foundTodos.length).toBe(2);
  });

  it('should return 404 if id is invalid', async () => {
    await request(app)
      .delete(`/todos/1234`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404);

    const foundTodos = await Todo.find({});
    expect(foundTodos.length).toBe(2);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', () => {
    const hexId = todos[0]._id.toHexString();
    const text = 'New updated text 1';

    return request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({ text, completed: true })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      });
  });

  it('should clear the completedAt when todo is not completed', () => {
    const hexId = todos[1]._id.toHexString();
    const text = 'New updated text 2';

    return request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({ text, completed: false })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      });
  });

  it('should not update a todo created by other user', () => {
    const hexId = todos[0]._id.toHexString();
    const text = 'New updated text 1';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({ text, completed: true })
      .expect(404);
  });

  it('should return 404 if todo not found', () => {
    const hexId = new ObjectID().toHexString();
    return request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404);
  });

  it('should return 404 if id is invalid', () =>
    request(app)
      .patch(`/todos/1234`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404));
});

describe('GET /users/me', () => {
  it('should return user if authenticated', () =>
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.user._id).toBe(users[0]._id.toHexString());
        expect(res.body.user.email).toBe(users[0].email);
      }));

  it('should return 401 if not authenticated', () =>
    request(app)
      .get('/users/me')
      .set('x-auth', '1234')
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      }));
});

describe('POST /users', () => {
  it('should create a user', async () => {
    const email = 'example@email.com';
    const password = 'test1234';
    const res = await request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body.user._id).toBeTruthy();
        expect(res.body.user.email).toBe(email);
      });

    const user = await User.findOne({ email });
    expect(user).toBeTruthy();
    expect(user.password).not.toBe(password);
    expect(user.toObject().tokens[0]).toMatchObject({
      access: 'auth',
      token: res.headers['x-auth'],
    });
  });

  it('should return validation errors if request invalid', () =>
    request(app)
      .post('/users')
      .send({ email: 'abcd', password: 'abc' })
      .expect(400));

  it('should not craete user if email in use', () =>
    request(app)
      .post('/users')
      .send({ email: users[0].email, password: 'asdafasfsdfsadfs' })
      .expect(400));
});

describe('POST /users/login', () => {
  it('should login user and return auth token', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: users[1].email, password: users[1].password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body.user._id).toBe(users[1]._id.toHexString());
        expect(res.body.user.email).toBe(users[1].email);
      });

    const user = await User.findById(users[1]._id);
    expect(user.toObject().tokens[1]).toMatchObject({
      access: 'auth',
      token: res.headers['x-auth'],
    });
  });

  it('should reject invalid email', () => {
    return request(app)
      .post('/users/login')
      .send({ email: 'doesnotexist@example.com', password: 'test1234' })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
        expect(res.body).toEqual({});
      });
  });

  it('should reject invalid password', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: users[1].email, password: 'test1234' })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toBeFalsy();
        expect(res.body).toEqual({});
      });

    const user = await User.findById(users[1]._id);
    expect(user.tokens.length).toBe(1);
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', async () => {
    await request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200);

    const user = await User.findById(users[0]._id);
    expect(user.tokens.length).toBe(0);
  });
});

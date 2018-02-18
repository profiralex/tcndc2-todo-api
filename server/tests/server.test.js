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
  it('should create a new todo', () => {
    const text = 'Test todo text';
    return request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
  it('should remove a todo', () => {
    const hexId = todos[1]._id.toHexString();
    return request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .then(_ => Todo.findById(hexId))
      .then(todo => {
        expect(todo).toNotExist();
      });
  });

  it('should not remove a todo created by other user', () => {
    const hexId = todos[1]._id.toHexString();
    return request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .then(_ => Todo.find({}))
      .then(todos => {
        expect(todos.length).toBe(2);
      });
  });

  it('should return 404 if todo not found', () => {
    const hexId = new ObjectID().toHexString();
    return request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .then(_ => Todo.find({}))
      .then(todos => {
        expect(todos.length).toBe(2);
      });
  });

  it('should return 404 if id is invalid', () =>
    request(app)
      .delete(`/todos/1234`)
      .set('x-auth', users[1].tokens[0].token)
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

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[1].tokens[0].token)
      .send({ text, completed: false })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
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
  it('should create a user', () => {
    const email = 'example@email.com';
    const password = 'test1234';
    return request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.user._id).toExist();
        expect(res.body.user.email).toBe(email);
      })
      .then(res => {
        return User.findOne({ email }).then(user => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth'],
          });
        });
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
  it('should login user and return auth token', () => {
    return request(app)
      .post('/users/login')
      .send({ email: users[1].email, password: users[1].password })
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.user._id).toBe(users[1]._id.toHexString());
        expect(res.body.user.email).toBe(users[1].email);
      })
      .then(res => {
        return User.findById(users[1]._id).then(user => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth'],
          });
        });
      });
  });

  it('should reject invalid email', () => {
    return request(app)
      .post('/users/login')
      .send({ email: 'doesnotexist@example.com', password: 'test1234' })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist();
        expect(res.body).toEqual({});
      });
  });

  it('should reject invalid password', () => {
    return request(app)
      .post('/users/login')
      .send({ email: users[1].email, password: 'test1234' })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).toNotExist();
        expect(res.body).toEqual({});
      })
      .then(res => {
        return User.findById(users[1]._id).then(user => {
          expect(user.tokens.length).toBe(1);
        });
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', () => {
    return request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .then(() => User.findById(users[0]._id))
      .then(user => {
        expect(user.tokens.length).toBe(0);
      });
  });
});

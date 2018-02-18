var env = process.env.NODE_ENV || 'development';

console.log('env *******', env);
if (env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
  process.env.PASSWORD_SALT_ROUNDS = 13;
} else if (env === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
  process.env.PASSWORD_SALT_ROUNDS = 1;
} else {
  process.env.PASSWORD_SALT_ROUNDS = 13;
}

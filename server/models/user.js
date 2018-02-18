const _ = require('lodash');
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
    },
  },
  password: {
    type: String,
    require: true,
    minlength: 6,
  },
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = async function() {
  const user = this;
  const access = 'auth';
  const token = jwt
    .sign({ _id: user._id.toHexString(), access }, 'abc123')
    .toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  await user.save();
  return token;
};

UserSchema.methods.removeToken = async function(token) {
  const user = this;
  return await user.update({
    $pull: {
      tokens: { token },
    },
  });
};

UserSchema.statics.findByToken = async function(token) {
  const User = this;
  const decoded = jwt.verify(token, 'abc123');

  return await User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
};

UserSchema.statics.findByCredentials = async function(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error('Wrong password');
  }

  return user;
};

UserSchema.statics.hashPassword = async function(password) {
  const rounds = parseInt(process.env.PASSWORD_SALT_ROUNDS);
  return await bcrypt.hash(password, rounds);
};

UserSchema.pre('save', function(next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  User.hashPassword(user.password)
    .then(hash => {
      user.password = hash;
      next();
    })
    .catch(e => {
      next(e);
    });
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };

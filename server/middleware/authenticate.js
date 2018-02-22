const { User } = require('./../models/user');

const authenticate = async (req, res, next) => {
  const token = req.header('x-auth');
  try {
    const user = await User.findByToken(token);
    if (!user) {
      throw Error('Unauthorized');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    return res.status(401).send();
  }
};

module.exports = {
  authenticate,
};

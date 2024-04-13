const User = require('../models/User');
const { CustomError } = require('../utils/error');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

const signIn = async (req, res, next) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      throw new CustomError('Mandatory fields missing', 400, false);
    }

    const user = await User.findOne({
      email,
      activated: true,
    });
    if (!user) {
      throw new CustomError('User not found', 404, false);
    }

    const passwordHash = user.passwordHash;
    const passwordMatch = await bcrypt.compare(password, passwordHash)
    if (passwordMatch === false) {
      throw new CustomError('Invalid credentials', 401, false);
    }

    const tokenData = {
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      activated: user.activated,
    }
    const token = jwt.sign(tokenData, jwtSecret, {
      expiresIn: jwtExpiresIn,
    });

    return res
      .status(200)
      .json({
        ...tokenData,
        token,
      })
  } catch (e) {
    next(e);
  }
}

module.exports = signIn;

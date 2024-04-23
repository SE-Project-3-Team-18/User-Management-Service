const User = require('../models/User');
const { CustomError } = require('../utils/error');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const ServiceRegistryClient = require('../utils/serviceRegistry');

const getSellerId = async (userId) => {
  try {
    const baseUrl = await ServiceRegistryClient
      .getInstance()
      .getUrl('Seller')
    const url = new URL(`/api/seller-by-uid/${userId}`, baseUrl).toString()

    const response = await axios.get(url, {
      userId,
    })
    return response.data.sellerId
  } catch (e) {
    let error = null
    if (axios.isAxiosError(e) === true) {
      if (e.response) {
        error = new CustomError(e.response?.data?.message, e.response?.status, false)
      } else {
        error = new CustomError(`Axios Error: ${e.message}`, 500, true)
      }
    } else {
      error = new CustomError(e.message, 500, true)
    }
    throw error
  }
}

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
    });
    if (!user) {
      throw new CustomError('User not found', 404, false);
    }

    const passwordHash = user.passwordHash;
    const passwordMatch = await bcrypt.compare(password, passwordHash)
    if (passwordMatch === false) {
      throw new CustomError('Invalid credentials', 401, false);
    }

    let sellerId
    if (user.role === 'seller') {
      sellerId = await getSellerId(user.id)
    }
    const tokenData = {
      userId: user.id,
      role: user.role,
      sellerId,
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

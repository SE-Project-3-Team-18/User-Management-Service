const ServiceRegistryClient = require('../utils/serviceRegistry');
const { v4: uuid } = require('uuid');
const axios = require('axios');
const bcrypt = require('bcrypt')
const Otp = require('../models/Otp');
const User = require('../models/User');
const { bcryptSaltRounds } = require('../config/auth');
const { CustomError } = require('../utils/error');

const sendEmail = async (emailTo, emailSubject, emailBody) => {
  const NotificationServiceUrl = await ServiceRegistryClient.getInstance().getUrl('Notification')
  const response = await axios.post(
    `${NotificationServiceUrl}/api/send-email`,
    {
      emailTo,
      emailSubject,
      emailBody,
    }
  );
  return response.data;
};

const emailSubject = 'Welcome to InstaCommerce'
const emailBodyTemplate = `
  <p> Hi {name}, Welcome to InstaCommerce.
  <br>
  This is your one time password to activate your account: 
  </p>
  <h1>{otp}</h1>
`

/**
 * This is a user facing route.
 * This route is not to be used for registration of seller.
 * signUp route to create new user (but not activate it).
 * flow of function:
 * - validation
 * - check if email alreayd in use
 * - create new otp if otp not exists in db
 * - mail the otp to user (Notification-Service)
 * - save user to db
 */
const signUp = async (req, res, next) => {
  try {
    // Extract user data from request body
    const {
      name,
      email,
      password,
      age,
      gender,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !age ||
      !gender
    ) {
      throw new CustomError('Required Fields missing', 400, false)
    }
    const existingUser = await User.findOne({
      email,
    })
    if (existingUser !== null) {
      throw new CustomError('Email already in use')
    }
    const existingOtpObject = await Otp.findOne({
      email,
    })
    let otp = null
    if (existingOtpObject === null) {
      otp = uuid()
      const newOtpObject = new Otp({
        email,
        otp,
      })
      await newOtpObject.save()
    } else {
      otp = existingOtpObject.otp
    }
    const emailBody = emailBodyTemplate
      .replace('{otp}', otp)
      .replace('{name}', name)
    await sendEmail(email, emailSubject, emailBody)

    const passwordHash = await bcrypt.hash(password, bcryptSaltRounds)

    const newUser = new User({
      name,
      email,
      passwordHash,
      age,
      gender,
      role: 'user',
      activated: false,
      creationDate: new Date(),
    })
    await newUser.save()
    return res
      .status(201)
      .json({
        success: true,
        message: 'SignUp successful, verify your email to proceed',
      })
  } catch (e) {
    next(e)
  }
};

module.exports = signUp;

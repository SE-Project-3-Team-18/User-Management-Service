const config = require('./config/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const CustomLogger = require('./utils/logger')
const { errorHandler } = require('./utils/error')
const ServiceRegistryClient = require('./utils/serviceRegistry')
const signUp = require('./controllers/signUp')
const activateAccount = require('./controllers/activate')
const signIn = require('./controllers/signIn')
const getProfile = require('./controllers/getProfile')
const getEmail = require('./controllers/getEmail')
const upgradeToSeller = require('./controllers/upgradeToSeller')

const mongoUrl = config.MONGODB_URI
const connection = mongoose.connection
mongoose.set('strictQuery', false)
mongoose.connect(mongoUrl, { useNewurlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connecting to MongoDB:', error.message)
  })

connection.once('open', () => {
  console.log('MongoDB Database connection Established Successfull')
})

// Initialise instance of CustomLogger singleton service.
CustomLogger.getInstance()

app.use('/', (req, res, next) => {
  CustomLogger
    .getInstance()
    .logHttpRequest(req, res);
  next();
})

app.use(cors())
app.use(express.json())

app.get('/api', async (req, res, next) => {
  try {
    // throw new CustomError('this endpoint shouldnt be accessed', 403)
    const uri = await ServiceRegistryClient
      .getInstance()
      .getUrl('template')
    console.log(uri)
    res
      .json({
        success: true,
        message: 'Hello',
      })
  } catch (e) {
    next(e)
  }
})

app.post('/api/signUp', signUp)
app.post('/api/activate-account', activateAccount)
app.post('/api/signIn', signIn)
app.get('/api/profile', getProfile)
app.get('/api/get-email/:userId', getEmail)
app.post('/api/upgrade-to-seller', upgradeToSeller)

app.use('/api', errorHandler)

module.exports = app

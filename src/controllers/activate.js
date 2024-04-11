const Otp = require('../models/Otp')
const User = require('../models/User')
const { CustomError } = require('../utils/error')

const activateAccount = async (req, res, next) => {
  try {
    const {
      email,
      otp,
    } = req.body

    if (
      !email ||
      !otp
    ) {
      throw new CustomError('Required fields missing', 400, false)
    }

    const existingOtpObject = await Otp.findOne({
      email,
      otp,
    })
    if (existingOtpObject === null) {
      throw new CustomError('Invalid otp', 403, false)
    }

    const user = await User.findOne({
      email,
    })
    if (user === null) {
      throw new CustomError('User not found', 404, false)
    }

    user.activated = true
    await user.save()

    await Otp.deleteOne({
      email,
      otp,
    })

    return res
      .status(200)
      .json({
        success: true,
        message: 'Account activated successfully',
      })
  } catch (e) {
    next(e)
  }
}

module.exports = activateAccount

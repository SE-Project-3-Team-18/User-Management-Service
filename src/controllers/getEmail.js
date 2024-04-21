const User = require('../models/User')
const { CustomError } = require('../utils/error')

const getEmail = async (req, res, next) => {
  try {
    const userId = req.params.userId

    const user = await User.findById(userId, {
      email: 1,
    })

    if (user === null) {
      throw new CustomError('User not found', 404, false)
    }

    return res
      .status(200)
      .json({
        success: true,
        message: 'Email details',
        email: user.email,
      })
  } catch (error) {
    next(error)
  }
}

module.exports = getEmail

const User = require('../models/User')
const { CustomError } = require('../utils/error')

const getProfile = async (req, res, next) => {
  try {
    const userId = req.get('X-User-Id')

    const user = await User.findById(userId)

    if (user === null) {
      throw new CustomError('User not found', 404, false)
    }

    const details = {
      id: user.id,
      name: user.name,
      creationDate: user.creationDate,
      email: user.email,
      age: user.age,
      gender: user.gender,
    }

    return res
      .status(200)
      .json({
        success: true,
        message: 'User details',
        details,
      })
  } catch (error) {
    next(error)
  }
}

module.exports = getProfile

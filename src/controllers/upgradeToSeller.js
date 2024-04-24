const User = require('../models/User');
const { CustomError } = require('../utils/error');

const upgradeToSeller = async (req, res, next) => {
  try {
    const {
      userId,
    } = req.body;
    console.log(userId)
    if (!userId) {
      throw new CustomError('userId is required', 400, false);
    }

    const user = await User.findOne({
      _id: userId,
    });
    if (!user) {
      throw new CustomError('User not found', 404, false);
    }
    if (user.activated === false) {
      throw new CustomError('User not activated', 400, false);
    }

    user.role = 'seller';
    await user.save();

    return res
      .status(200)
      .json({
        success: true,
        message: 'User upgraded to seller',
      });
  } catch (error) {
    next(error);
  }
}

module.exports = upgradeToSeller

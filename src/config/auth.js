const bcryptSaltRounds = 10
const jwtSecret = process.env.JWT_SECRET
const jwtExpiresIn = '1d'

module.exports = {
  bcryptSaltRounds,
  jwtSecret,
  jwtExpiresIn,
}

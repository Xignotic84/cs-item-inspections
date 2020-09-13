// Require bcrypt
const bcrypt = require('bcrypt')

const functions = require('./../interface/functions')

module.exports = {
  // Use hash function from bcrypt to hash plain password
  async hash(password) {
    if (!password) throw new Error('Missing args on hash function')
    return bcrypt.hashSync(password, 10)
  },

  // Compre plain and hashed password
  async compare(plainPassword, password) {
    if (!plainPassword || !password) throw new Error('Missing args on compare function')
    return bcrypt.compareSync(plainPassword, password)
  },

}
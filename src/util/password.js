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

  async checkUser(id, plainPassword) {
    if (!id) throw new Error('Missing args on checkUser function')
    // Get from cache or database
    const user = await functions.findOne(1, {id: id}, {
      enabled: true,
      key: `user:${id}`
    })

    if (!user) return false

    // Use compare function to check if password is valid. Returns Boolean

    return await this.compare(plainPassword, user.password)
  }
}
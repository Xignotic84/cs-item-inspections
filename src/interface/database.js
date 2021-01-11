const mongoose = require('mongoose')
// Require mongo schema/models
require('./models')
require('./redis')

module.exports = {
  // Database connect function
  async connect() {
    try {
      mongoose.connect(`mongodb://localhost/cs-inspections`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
      })
    } catch (err) {
      console.error(`[MONGO] Failed to connect\n${err}`)
      return this.connect()
    }
    console.log(`[MONGO] Connected to Database`)
  }
}


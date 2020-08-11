const mongoose = require('mongoose')
require('./models')

module.exports = {
  async connect() {
    try {
      mongoose.connect(`mongodb://localhost/cs-quiz`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: true
      })
    } catch (err) {
      console.error(`[MONGO] Failed to connect\n${err}`)
      return this.connect()
    }
    console.log(`[MONGO] Connected to Database`)
  }
}


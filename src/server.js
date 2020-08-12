// Require the .env file which is used for configurations
require('dotenv').config()

// Require database and interface files
const _db = require('./interface/database');

// Initiate express
const express = require('express')
const app = express()
const Routers = require('./routers')

// Listen to port specified in env file
app.listen(process.env.PORT, async () => {
  await _db.connect()
  console.log(`Listening to port:${process.env.PORT}`)
})

// Serving of static files
app.use(express.static(`${process.cwd().replace(/[\\]/, '/')}/views/public/`))

// Listen to routes
app.use('/', Routers.main)
app.use(['/auth', '/authorize'], Routers.auth)
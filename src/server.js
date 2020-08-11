require('dotenv').config()
const _db = require('./interface/database');

const express = require('express')
const app = express()

const Routers = require('./routers')

app.listen(process.env.PORT, async () => {
  await _db.connect()
  console.log(`Listening to port:${process.env.PORT}`)
})

app.use('/', Routers.main)
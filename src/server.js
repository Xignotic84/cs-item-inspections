// Require the .env file which is used for configurations
require('dotenv').config()

// Require database and interface files
const _db = require('./interface/database');

// Initiate express
const express = require('express')
const app = express()
const Routers = require('./routers')

// Handle express sessions using redis
const session = require('express-session')
const redis = require('redis')
const redisClient = redis.createClient({db: 0})
const RedisStore = require('connect-redis')(session)

const bodyParser = require('body-parser')
// Use body parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(session({
  secret: process.env.COOKIE_SECRET || '11AACC',
  store: new RedisStore({client: redisClient}),
  resave: false,
  saveUninitialized: true,
  cookie: {expires: 604800000}
}))


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
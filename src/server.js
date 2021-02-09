// Require the .env file which is used for configurations
require('dotenv').config()

// Require database and interface files
const _db = require('./interface/database');
const _functions = require('./interface/functions')
const redisFunctions = require('./interface/redis')

// Initiate express
const express = require('express')
const app = express()
const Routers = require('./routers')

// Handle express sessions using redis
const session = require('express-session')
const redis = require('redis')
// Create redis client
const redisClient = redis.createClient({db: 0})
const RedisStore = require('connect-redis')(session)

app.set('trust proxy', 1)

// Use Helmet NPM module to prevent xss
const helmet = require("helmet");
app.use(helmet.xssFilter());

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


const mail = require('./util/mailer')

// Listen to port specified in env file
app.listen(process.env.PORT, async () => {
  // Connect to database
  await _db.connect()
  // Initiate mailing service
  mail.init()

  console.log(`Listening to port:${process.env.PORT}`)
})

app.use((req, res, next) => {
  req.db = _functions
  req.redis = redisFunctions
  next()
})

// Serving of static files
app.use(express.static(`${process.cwd().replace(/[\\]/, '/')}/views/public/`))

// Listen to routes
app.use(['/auth', '/authorize'], Routers.auth)

app.use((req, res, next) => {
  // Require users to be signed in to access the rest of the site.
  if (!req.session.user) return res.status(403).redirect('/auth/login')

  next()
})

app.use('/', Routers.main)
app.use('/item', Routers.item)
app.use('/admin', Routers.admin)
app.use('/characteristic', Routers.characteristic)


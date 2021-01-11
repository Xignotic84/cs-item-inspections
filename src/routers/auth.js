const express = require('express')
const Router = express.Router()
const Password = require('./../util/password')
const uniqueString = require('unique-string');
const mail = require('./../util/mailer')

// Function taken from stackoverflow to validate emails
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Listen to endpoints on this route
Router.get('/login', (req, res) => {
  // Render page with data
  res.render('pages/login.ejs', {pagetitle: 'Login', user: false, message: false})
})

Router.get('/signup', (req, res) => {
  // Render page with data
  res.render('pages/signup.ejs', {pagetitle: 'Signup', user: false, message: false})
})

Router.get(['/logout', '/signout'], (req, res) => {
  // Clear session cookies for user
  res.clearCookie('connect.sid')
  req.session.destroy()
  res.redirect('/')
})

Router.post('/login', async (req, res) => {
  const body = req.body
  const {password, username} = body

  if (!(password && username)) {
    return res.status(400).json({message: 'You need to provide a password'})
  }

  // Get user from db
  const foundUser = await req.db.getUser(req.body.username)
  if (!foundUser) return res.status(401).json({message: 'Invalid login'})

  // Compare passwords with the hashed password from the database and the plain password provided with the post request, this uses bcrypt
  if (!await Password.compare(password, foundUser.password)) return res.status(401).json({message: 'Invalid login'})

  if (foundUser.permissionLevel === 0) return res.header('location', '/auth/login').status(401).json({message: `Your account is pending approval, please wait until it's approved and try again.`})

  // Set user session
  req.session.user = Object.assign({
    loggedInAt: new Date(),
    unix_loggedInAt: Date.now()
  }, foundUser)

  res.header('location', '/').status(200).json({message: `Successfully logged in as ${foundUser.username}`})
})

Router.post('/signup', async (req, res) => {
  const body = req.body
  if (!body) return res.status(400).json({code: 400, message: 'No body provided'}).redirect('/')

  let {email, username, password} = body

  // Check if teacher checkbox is set to true
  if (!email) return res.status(400).json({message: 'You need to provide an email'})

  // Run validate email to ensure email is an actual email
  if (!validateEmail(email)) return res.status(400).json({message: 'You need to provide a valid email'})

  if (!username) return res.status(400).json({message: 'You need to provide an username'})

  // Make sure that the username only includes non special characters
  if (!username.match(/^[a-z0-9-.]+$/gi)) return res.status(400).json({message: 'Only letters (az), numbers (0-9) and decimal points (.) are accepted.'})

  if (!password) return res.status(400).json({message: 'You need to provide a password'})

  // Request to database to see if the user exists
  const foundUser = await req.db.getUser(username, email)

  // Check if user exists
  if (foundUser) return res.status(400).json({message: 'An account with this email or username already exists'})


  // Remove these from body object to prevent them from being stored as they are defined differently
  delete body.password

  // Hash password using passoword with bcrypt
  password = await Password.hash(password)

  // Create user collection in database with body from post request
  await req.db.create(1, {
    id: uniqueString(),
    permissionLevel: 0,
    password,
    ...body,
    unix_created_at: Date.now()
  })


  // Add email to queue for sending
  mail.send('signup', {
    from: 'Item Inspection Support <contact@xignotic.dev>',
    to: req.body.email, subject: 'Inspection account creation',
    text: "We've received your sign up request, please note that it will be reviewed by a supervisor and you will be informed once your account has been approved. \nYou can login using this link: https://inspection.xignotic.dev"
  })

  res.header('location', '/auth/login').status(200).json({message: `Your account is pending approval, please wait until it's approved and try again.`})
})

module.exports = Router

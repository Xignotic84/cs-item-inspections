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
    unix_loggedInAt: new Date().getTime()
  }, foundUser)

  res.header('location', '/').status(200).json({message: `Successfully logged in as ${foundUser.username}`})
})

Router.post('/signup', async (req, res) => {
  const body = req.body
  // Check if body exists
  if (!body) return res.status(400).json({code: 400, message: 'No body provided'}).redirect('/')

  let {email, username, password} = body

  // Check if email is provided
  if (!email) return res.status(400).json({message: 'You need to provide an email'})

  // Run validate email to ensure email is an actual email
  if (!validateEmail(email)) return res.status(400).json({message: 'You need to provide a valid email'})

  // Check if a username was provided
  if (!username) return res.status(400).json({message: 'You need to provide an username'})

  // Make sure that the username only includes non special characters
  if (!username.match(/^[a-z0-9-.]+$/gi)) return res.status(400).json({message: 'Only letters (az), numbers (0-9) and decimal points (.) are accepted.'})

  // Check if a password was provided
  if (!password) return res.status(400).json({message: 'You need to provide a password'})

  // Get user from database
  const foundUser = await req.db.getUser([username, email])

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
    unix_created_at: new Date().getTime()
  })

  // Queue and send signup success email
  mail.send('signup', {
    from: 'Item Inspection Support <noreply@xignotic.dev>',
    to: req.body.email, subject: 'Inspection account creation',
    text: "We've received your sign up request, please note that it will be reviewed by a supervisor and you will be informed once your account has been approved. \nYou can login using this link: https://inspection.xignotic.dev"
  })

  // Redirect to login page with message
  res.header('location', '/auth/login').status(200).json({message: `Your account is pending approval, please wait until it's approved and try again.`})
})


Router.get('/reset', async (req, res) => {

  if (req.query.token || req.session.user) {
    const key = `reset:${req.query.token}`

    // Check if user is signed in or token is valid
    let data = req.session.user || await req.redis.get(key)

    // Redirect if token is invalid
    if (!data) return res.header('location', '/').status(200).json({message: `Invalid reset token.`})

    return res.render('pages/resetpwd.ejs', {
      pagetitle: 'Reset password',
      user: req.session.user || false,
      message: false
    })
  } else {
    res.render('pages/reset.ejs', {pagetitle: 'Reset password', user: req.session.user || false, message: false})
  }
})

Router.post('/reset', async (req, res) => {
  const user = req.session.user
  if (req.query.token || user) {
    const key = `reset:${req.query.token}`
    let data = user || await req.redis.get(key)

    // Check if user is signed in or reset token is valid
    if (!data) return res.header('location', '/').status(200).json({message: `Invalid reset token.`})

    // Check if data type is string and parse
    if (typeof data === 'string') data = JSON.parse(data)

    // Check if user is from admin account to prevent changing of this specific password
    if (data.email === 'admin@gmail.com') return res.status(401).json({message: "You cannot change this accounts password"})

    const {password1, password2, oldpassword} = req.body

    if (user && !oldpassword) return res.status(401).json({message: 'You need to input your current password'})

    // Compare current password to new password to ensure it's different
    if (user && !await Password.compare(oldpassword, user.password)) return res.status(401).json({message: 'Invalid current password'})

    // Check if old password and new password match
    if (oldpassword === password1) return res.status(400).json({message: 'Current and new passwords cannot match'})

    // Check if both passwords don't match
    if (password1 !== password2) return res.status(400).json({message: 'Your new passwords need to match'})

    // Hash new password for storage
    const hashedPassword = await Password.hash(password1)

    // Update password for user in database
    req.db.update(1, {email: data.email}, {
      password: hashedPassword
    }, false)


    // Delete token to prevent further resets
    await req.redis.del(key)

    return res.header('location', '/auth/logout').status(200).json({message: 'Your password has been reset'})
  }

  const email = req.body.email

  if (!email) return res.status(400).json({message: 'You need to provide an email address'})

  // Validate the email address
  if (!validateEmail(email)) return res.status(400).json({message: 'You need to provide a valid email'})

  // Generate token for request
  const token = uniqueString()

  // Stringify data for redis
  const data = JSON.stringify({email: email})

  // Set token expiration for 5 minutes
  req.redis.set(`reset:${token}`, data, 'ex', 300)

  // Email regeneration email to user with token
  mail.send('regen', {
    from: 'Item Inspection Support <noreply@xignotic.dev>',
    to: req.body.email,
    subject: 'Password reset request',
    text: `Password reset requested for your Account \nPassword Reset link: ${req.get('host')}${req.baseUrl}/reset?token=${token}`
  })

  res.status(200).json({message: 'Successfully sent password reset request'})
})


module.exports = Router

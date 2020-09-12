const express = require('express')
const Router = express.Router()
const password = require('./../util/password')
const functions = require('./../interface/functions')
const uniqueString = require('unique-string');

// Listen to endpoints on this route
Router.get('/login', (req, res, next) => {
  const user = req.session.user
  if ((user && user.password)) return res.status(200).redirect('/')

  // Render page with data
  res.render('pages/login.ejs', {pagetitle: 'Login', user: false, message: false})

  next()
})

Router.get('/signup', (req, res, next) => {
  const user = req.session.user
  if ((user && user.password)) return res.status(200).redirect('/')

  // Render page with data
  res.render('pages/signup.ejs', {pagetitle: 'Signup', user: false, message: false})

  next()
})

Router.get(['/logout', 'signout'], (req, res, next) => {
  res.clearCookie('connect.sid')
  req.session.destroy()
  res.redirect('/')
  next()
})

Router.post('/login', async (req, res, next) => {
  const body = req.body
  const password = body.password
  const username = body.username
  console.log(username, password)

  if (!(password && username)) {
    return res.status(400).render('pages/login.ejs', {
      pagetitle: 'Login',
      message: `You need to provide a username and password!`,
    })
  }

  const foundUser = await functions.getUser(req.body.username)

  if (foundUser) {
    req.session.user = {
      data: foundUser,
      loggedInAt: new Date(),
      unix_loggedInAt: Date.now()
    }

    res.status(200).redirect('/')

    next()
  } else {
    res.status(401).render('pages/login.ejs', {pagetitle: 'Login', message: 'Invalid login'})
  }
})

Router.post('/signup', async (req, res, next) => {
  const body = req.body
  if (!body) return res.status(400).json({code: 400, message: 'No body provided'}).redirect('/')

  let {email, username, password, is_teacher} = body

  is_teacher = is_teacher === 'on';

  if (!email) return res.status(400).render('pages/signup.ejs', {pagetitle: 'Signup', message: 'You need to provide an email'})

  if (!username) return res.status(400).render('pages/signup.ejs', {pagetitle: 'Signup', message: 'You need to provide an email'})

  if (!password) return res.status(400).render('pages/signup.ejs', {pagetitle: 'Signup', message: 'You need to provide an password'})

  const foundUser = await functions.getUser(req.body.username)

  if (foundUser) return res.status(400).render('pages/signup.ejs', {pagetitle: 'Signup', message: 'An account with this username already exists'})

  delete body.is_teacher

  const user = await functions.create(1, {
    id: uniqueString(),
    is_teacher,
    ...body,
    timestamp: new Date(),
    unix_timestamp: Date.now()
  })

  console.log(body)


  req.session.user = {
    data: user,
    loggedInAt: new Date(),
    unix_loggedInAt: Date.now()
  }

  res.status(200).redirect('/')

})

module.exports = Router
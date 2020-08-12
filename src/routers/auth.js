const express = require('express')
const Router = express.Router()

// Listen to endpoints on this route
Router.get('/login', (req, res, next) => {

  // Render page with data
  res.render('pages/login.ejs', {})

  next()
})

module.exports = Router
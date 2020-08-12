const express = require('express')
const Router = express.Router()

// Listen to endpoints on this route
Router.get('/', (req, res, next) => {

  // Render page with data
  res.render('pages/index.ejs', {
    pagetitle: 'Home'
  })

  next()
})

module.exports = Router
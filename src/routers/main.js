const express = require('express')
const Router = express.Router()

// Listen to endpoints on this route
Router.get('/', async (req, res, next) => {
  // Check if user is signed in, if not send to login page

  const items = await req.db.find(2, {})

  // Render page with data
  res.render('pages/index.ejs', {
    pagetitle: 'Home',
    items: items || [],
    user: req.session.user || false,
  })

  next()
})

module.exports = Router
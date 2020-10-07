const express = require('express')
const Router = express.Router()

// Listen to endpoints on this route
Router.get('/', async (req, res, next) => {

  const quizzes = await req.db.find(4, {})

  // Render page with data
  res.render('pages/index.ejs', {
    pagetitle: 'Home',
    user: req.session.user || false,
    quizzes: quizzes || [],
  })

  next()
})

module.exports = Router
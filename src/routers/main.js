const express = require('express')
const Router = express.Router()

// Listen to endpoints on this route
Router.get('/', async (req, res, next) => {

  const quizzes = await req.db.find(4, {is_public: true})
  const groups = await req.db.find(3, {is_public: true})

  // Render page with data
  res.render('pages/index.ejs', {
    pagetitle: 'Home',
    user: req.session.user || false,
    quizzes: quizzes || [],
    groups: groups || []
  })

  next()
})

module.exports = Router
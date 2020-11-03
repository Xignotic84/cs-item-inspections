const express = require('express')
const Router = express.Router()

// Listen to endpoints on this route
Router.get('/create', async (req, res, next) => {
    if (!req.session.user) return res.status(401).redirect('/auth/login')

    res.status(200).render('pages/create-quiz.ejs', {user: req.session.user, pagetitle: 'Create Quiz',})
})

Router.post('/create', async (req, res) => {
    console.log(req.body)


    return res.status(200)
})

module.exports = Router
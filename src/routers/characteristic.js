const express = require('express')
const Router = express.Router()
const uniqueString = require('unique-string');

Router.get('/create', async (req, res, next) => {
    // Render page with data
    res.render('pages/characteristic-create.ejs', {
        pagetitle: 'Home',
        items: [],
        user: req.session.user || false,
    })
})

Router.post('/create', async (req, res) => {
    const {name, description} = req.body

    // Check if name exists if not respond with error
    if (!name) return res.status(400).json({message: 'You need to provide a name for the characteristic'})
    // Ensure name is not greater than 20 characters
    if (name.length > 20) return res.status(400).json({message: 'You cannot provide a name longer than 20 characters'})
    // Ensure that description is not longer than 300 characters
    if (description.length > 300) return res.status(400).json({message: 'You cannot provide a characteristic longer than 300 characters'})

    // Create new inspection in db
    req.db.create(4, {
        id: uniqueString(),
        creator: req.session.user.username,
        name: name,
        description: description || "None provided",
        unix_created_at: new Date().getTime()
    })

    // Delete characteristics from cache
    req.redis.del('characteristics')

    // Respond to request with location header and json body with message
    res.header('location', '/').status(200).json({message: `Created characteristic ${name}`})

    // Update analytics in database
    req.db.update(1, {id: req.session.user.id}, {$inc: {'analytics.characteristicCount': 1}})

})


Router.post('/:id/delete', async (req, res) => {
    const id = req.params.id

    // Delete item from db
    await req.db.delete(4, {id: id})

    await req.redis.del('characteristics')

    // Respond to request with location header and json body with message
    res.header('location', '/').status(200).json({message: `Deleted characteristic`})
})

module.exports = Router

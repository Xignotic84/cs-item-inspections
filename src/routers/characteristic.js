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

    if (!name) return res.status(400).json({message: 'You need to provide a name for the characteristic'})

    if (name.length > 20) return res.status(400).json({message: 'You cannot provide a name longer than 20 characters'})

    if (description.length > 300) return res.status(400).json({message: 'You cannot provide a characteristic longer than 300 characters'})

    // Create new inspection in db
    req.db.create(4, {
        id: uniqueString(),
        creator: req.session.user.username,
        name: name,
        description: description || "None provided",
        unix_created_at: new Date().getTime()
    })

    req.redis.del('characteristics')

    // Respond to request with location header and json body with message
    res.header('location', '/').status(200).json({message: `Created characteristic ${name}`})

    req.db.update(1, {id: req.session.user.id}, {$inc: {'analytics.characteristicCount': 1}})

})


Router.post('/:id/delete', async (req, res) => {
    const id = req.params.id

    // Delete item from db
    await req.db.delete(2, {id: id})

    // Delete inspections from db
    await req.db.deleteMany(3, {item_id: id})

    // Respond to request with location header and json body with message
    res.header('location', '/').status(200).json({message: `Deleted item`})
})

module.exports = Router

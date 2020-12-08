const express = require('express')
const Router = express.Router()
const uniqueString = require('unique-string');
const mtz = require('moment-timezone')


// Listen to endpoints on this route
Router.get('/create', async (req, res, next) => {
    // Render page with data
    res.render('pages/item-create.ejs', {
        pagetitle: 'Home',
        items: [],
        user: req.session.user || false,
    })
})

Router.post('/create', async (req, res, next) => {
    console.log(req.body)

    const {name, location} = req.body

    if (!name) return res.status(400).json({message: 'You need to provide an item name'})

    if (!location) return res.status(400).json({message: 'You need to provide the location of the item'})

    req.db.create(2, {
        id: uniqueString(),
        ...req.body,
        unix_created_at: Date.now()
    })

    res.header('location', '/').status(200).json({message: `Successfully created item ${name}`})
})

Router.get('/:id', async (req, res) => {
    const id = req.params.id

    // Get item and inspections from db
    const item = await req.db.findOne(2, {id: id})
    const inspections = await req.db.find(3, {item_id: id})
    console.log(item)

    // Check if item is in db
    if (!item) return res.status(404).render('pages/error.ejs', {
        pagetitle: 'Error',
        error: {code: 404, message: 'Not found'
        },
        user: req.session.user || false
    })


    // Render page
    res.status(200).render('pages/item.ejs', {
        pagetitle: `Item, | ${item.name}`,
        item: item,
        lastInspected: mtz(item.lastInspected).tz("Asia/Hong_Kong").format("HH:mm (YYYY/MM/DD)"),
        inspections: inspections.sort((a, b) => b.unix_created_at - a.unix_created_at),
        user: req.session.user || false,
    })
})

Router.post('/:id/inspect', async (req, res) => {
    const id = req.params.id

    console.log(req.body)
    // Check if item exists
    const item = await req.db.findOne(2, {id: id})

    if (!item) res.status(404).json({message: 'No item was found with this ID'})

    const {note, characteristic} = req.body

    req.db.create(3, {
        id: uniqueString(),
        inspector: req.session.user.username,
        item_id: id,
        note: note || "None Provided",
        characteristic: characteristic || "None Provided",
        unix_created_at: Date.now(),
    })

    req.db.update(2, {id: id}, {lastInspected: Date.now()})

    res.header('location', '/').status(200).json({message: `Inspected ${item.name}`})
})


module.exports = Router
const express = require('express')
const Router = express.Router()
const moment = require('moment')
const itemFreq = require('./../util/itemFrequency')

// Listen to endpoints on this route
Router.get('/', async (req, res, next) => {
  // Check if user is signed in, if not send to login page

  // Get items from cache or from db
  let items = await req.redis.get('items') || await req.db.find(2, {}, {key: 'items'})
  // Check if data is from cache then parse from string.
  if (typeof items === 'string') items = JSON.parse(items)

  // Get characteristics from cache or db
  let characteristics = await req.redis.get('characteristics') || await req.db.find(4, {}, {key: 'characteristics'})
  // Check if characteristics is from cache and parse from string
  if (typeof characteristics === 'string') characteristics = JSON.parse(characteristics)

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    item.lastInspectedText = item.lastInspected ? moment(item.lastInspected).fromNow() : false
    // Calculate difference between current time and last inspected
    const diff = Math.abs(new Date().getTime() - item.lastInspected)
    // Calculate the difference in days and see if it's greater than the frequency.
    if (Math.ceil(diff / (1000 * 60 * 60 * 24)) >  itemFreq[item.frequency]) {
      item.needsInspection = true
    }
  }

  // Render page with data
  res.render('pages/index.ejs', {
    pagetitle: 'Home',
    items: items || [],
    characteristics : characteristics || [],
    user: req.session.user || false,
  })

  next()
})

module.exports = Router

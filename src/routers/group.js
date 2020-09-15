const express = require('express')
const Router = express.Router()
const uniqueString = require('unique-string');
const shortid = require('shortid')
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');


Router.get('/create', (req, res) => {
  if (!(req.session.user && req.session.user.id)) return res.status(401).redirect('/auth/login')

  res.status(200).render('pages/create-group.ejs', {
    pagetitle: 'Create Group',
    user: req.session.user || false
  })
})

Router.post('/create', async (req, res) => {
  if (!(req.session.user && req.session.user.id)) return res.status(401).redirect('/auth/login')

  const body = req.body

  const {name, description} = body

  const id = uniqueString()

  await req.db.create(2, {
    id: id,
    owner_id: req.session.user.id,
    code: shortid.generate(),
    name: name,
    description: description,
    created_at: new Date(),
    unix_created_at: Date.now()
  })

  const newGroups = [ ...req.session.user.groups, {id: id, joined_at: new Date(), unix_joined_at: Date.now(), owner: true}]

  await req.db.update(1, {id: req.session.user.id}, {
    groups: newGroups
  })

  req.session.user.groups = newGroups

  res.status(200).redirect(`/group/${id}`)
})

// Listen to endpoints on this route
Router.get('/:id', async (req, res) => {
  const id = req.params.id

  // Get data from db or cache then set it into cache
  const foundGroup = await req.db.findOne(2, {id: id}, {key: `group:${id}`})

  if (!foundGroup) return res.status(404).render('pages/error.ejs', {
    pagetitle: `Error`,
    error: {
      code: 404,
      message: "I couldn't find that group",
    },
    user: req.session.user || false
  })

  res.status(200).render('pages/group.ejs', {
    pagetitle: foundGroup.name,
    group: foundGroup,
    user: req.session.user || false
  })

})

Router.post('/join/:code', async (req, res) => {
  if (!req.session.user) return res.status(401).redirect('/auth/login')

  const code = req.params.code

  // Get data from db or cache then set it into cache
  const foundGroup = req.db.findOne(2, {code: code}, {key: `group:-ID`})

  if (!foundGroup) return res.status(404).render('pages/error.ejs', {
    pagetitle: `Error`,
    error: {
      code: 404,
      message: "Couldn't find a group with th  at code",
    },
    user: req.session.user || false
  })

  const newGroups = [ ...req.session.user.groups, {id: foundGroup.id, joined_at: new Date(), unix_joined_at: Date.now(), owner: false}]

  await req.db.update(1, {id: req.session.user.id}, {
    groups: newGroups
  })

  req.session.user.groups = newGroups

  res.status(200).redirect(`/${foundGroup.id}`)
})

module.exports = Router
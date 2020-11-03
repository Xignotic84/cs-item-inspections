const express = require('express')
const Router = express.Router()
const uniqueString = require('unique-string');
const nanoid = require('nanoid')


Router.get('/create', (req, res) => {
  if (!(req.session.user && req.session.user.id)) return res.status(401).redirect('/auth/login')

  res.status(200).render('pages/create-group.ejs', {
    pagetitle: 'Create Group',
    user: req.session.user || false
  })
})

Router.post('/create', async (req, res) => {
  const user = req.session.user
  if (!(user && user.id)) return res.status(401).redirect('/auth/login')

  const body = req.body

  const {name, description, is_public} = body

  if (!name) return res.status(400).json({message: 'You need to provide a name'})

  if (name.length > 50) return res.status(400).json({message: 'Your name cannot be greater than 50 characters'})

  if (!description) return res.status(400).json({message: 'You need to provide a description for your group'})

  if (description.length > 100) return res.status(400).json({message: 'Your description cannot be greater than 100 characters'})

  // Generate group id
  const id = uniqueString()

  // Create group
  await req.db.create(3, {
    id: id,
    owner_id: user.id,
    code: nanoid.nanoid(6).toLowerCase(),
    name: name,
    is_public: is_public,
    description: description,
    unix_created_at: Date.now()
  }, {key: 'group:-ID'})

  // Create member in DB to link group with user
  const newGroup = await req.db.create(2, {
    user_id: user.id,
    group_id: id,
    permissions: 1,
    unix_joined_at: Date.now()
  })

  // Set user groups in session
  user.groups = [...user.groups || [], newGroup._doc]

  res.header('location', `/group/${id}`).status(200).json({message: `Successfully created ${name}`})
})

Router.post('/:id/delete', async (req, res) => {
  const user = req.session.user
  if (!(user && user.id)) return res.status(401).redirect('/auth/login')
  const id = req.params.id

  const userGroup = user.groups.filter(g => g.group_id === id)[0]

  if (!userGroup) {
    return res.status(401).json({message: "You're not authorized to delete this group",})
  }

  const foundGroup = await req.db.findOne(3, {id: id})

  if (!foundGroup) {
    return res.status(404).json({message: "I couldn't find that group"})
  }

  if (userGroup.permissions !== 1) {
    return res.status(401).json({message: "You're not authorized to delete this group"})
  }

  // Delete group from db and cache
  await req.db.delete(3, {id: id}, `group:${id}`)

  // Delete member
  await req.db.deleteMany(2, {group_id: id})

  // Remove group from user session
  user.groups = user.groups.filter(g => g.group_id !== foundGroup.id)

  res.header('location', `/user/me`).status(200).json({message: `Successfully deleted ${foundGroup.name}`})
})

Router.post('/:id/leave', async (req, res) => {
  const user = req.session.user
  if (!user) return res.status(401).redirect('/auth/login')

  const foundGroup = user.groups.filter(g => g.group_id === req.params.id)[0]

  if (!foundGroup) {
    return res.status(404).json({message: "Couldn't find that group"})
  }

  if (foundGroup.permissions === 1) {
    return res.status(500).json({message: "You cannot leave this group because you own it",})
  }

  await req.db.delete(2, {group_id: foundGroup.id})

  // Remove group from user session
  user.groups = user.groups.filter(g => g.group_id !== foundGroup.id)

  res.header('location', `/user/me`).status(200).json({message: 'Successfully left your group'})

})


Router.get(['/join/:code', '/join'], async (req, res) => {
  const user = req.session.user
  if (!user) return res.status(401).redirect('/auth/login')

  const code = req.params.code || req.body.code

  // Check if code exists and is either passed through body or param
  if (!code) return res.status(400).redirect('/me')

  // Get data from db or cache then set it into cache
  const foundGroup = await req.db.findOne(3, {code: code}, {key: `group:-ID`})

  if (!foundGroup) {
    return res.status(404).render('pages/error.ejs', {
      pagetitle: `Error`,
      error: {
        code: 404,
        message: "Couldn't find a group with that code",
      },
      user: req.session.user || false
    })
  }

  const userGroup = user.groups?.filter(g => g.group_id === foundGroup.id)

  if (userGroup && userGroup[0]) {
    return res.status(200).redirect(`/group/${foundGroup.id}`)
  }


  // Create member for group
  const newGroup = await req.db.create(2, {
    user_id: req.session.user.id,
    group_id: foundGroup.id,
    permissions: 3,
    unix_joined_at: Date.now()
  })

  // Add member to user groups
  user.groups = [...user.groups || [], newGroup._doc]

  res.status(200).redirect(`/group/${foundGroup.id}`)
})


// Listen to endpoints on this route
Router.get('/:id', async (req, res) => {
  const id = req.params.id

  // Get data from db or cache then set it into cache
  const foundGroup = await req.db.findOne(3, {id: id}, {key: `group:${id}`})

  if (!foundGroup) {
    return res.status(404).render('pages/error.ejs', {
      pagetitle: `Error`,
      error: {
        code: 404,
        message: "I couldn't find that group",
      },
      user: req.session.user || false
    })
  }

  const user = req.session.user

  // Check if user is in group
  if (!user.groups.filter(g => g.group_id === foundGroup.id)[0]) {
    return res.status(401).render('pages/error.ejs', {
      pagetitle: `Error`,
      error: {
        code: 401,
        message: "You are not authorized to view this page",
      },
      user: user || false
    })
  }

  res.status(200).render('pages/group.ejs', {
    pagetitle: foundGroup.name,
    group: foundGroup,
    user: user || false
  })

})

module.exports = Router
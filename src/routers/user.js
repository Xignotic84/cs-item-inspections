const express = require('express')
const Router = express.Router()

// Listen to endpoints on this route
Router.get(['/:id', '/me'], async (req, res, next) => {
    const id = req.params.id

    const user = req.session .user

    if (!user && req.path === '/me') {
        return res.status(200).redirect('/auth/login')
    }
    let foundGroups = await req.db.find(3, {id: user.groups?.map(g => g.group_id)}, {key: `groups:${user.id}`})

    if (typeof foundGroups === 'string') foundGroups = JSON.parse(foundGroups)


    // Check if path is /me and if so use sesion user or get from db
    let foundUser = (req.path === '/me' || id === user.id) ? user : await req.db.findOne(1, {id: id}, {key: `user:${id}`})
    // Render page with data
    if (typeof foundUser === 'string') foundUser = JSON.parse(foundUser)
    res.status(200).render('pages/user.ejs', {
        pagetitle: foundUser.username,
        user: user || false,
        foundUser: foundUser,
        groups: foundGroups,
        members: foundUser.groups
    })
})

Router.post('/me/delete', async (req, res) => {
    await req.db.delete(1, {id: user.id}, `user:${req.session.user.id}`)

    await req.db.delete(2, {user_id: user.id})

    res.status(200).redirect('/auth/logout')
})

module.exports = Router
const express = require('express')
const Router = express.Router()
const permissionLevels = require('./../util/permissionLevels')
const mail = require('./../util/mailer')

// Listen to endpoints on this route
Router.get('/', async (req, res, next) => {

    if (req.session.user?.permissionLevel !== 3) return res.status(401).render('pages/error.ejs', {
        pagetitle: 'Error',
        user: req.session.user || false,
        error: {
            code: 401,
            message: 'Not authorized'
        }
    })

    // Get all users from db
    const users = await req.db.find(1, {})
    const characteristics = await req.db.find(3 , {})

    res.status(200).render('pages/admin.ejs', {
        pagetitle: 'Admin Dashboard',
        user: req.session.user || false,
        permissions: permissionLevels,
        characteristics: characteristics,
        users: users
    })
})

Router.post('/permissions/:id/:permission', async (req, res) => {
    const id = req.params.id
    // Check if user is attempting to edit their own permission level
    if (req.session.user.id === req.params.id) return res.status(403).json({message: "You cannot edit your own permissions"})

    // Check if it is a number or not
    if (isNaN(req.params.permission)) return res.status(400).json({message: 'Invalid permission level, please refresh'})

    // Convert from string to number
    const permission = Number(req.params.permission)

    // Try to get user from cache and then database.
    let user = await req.redis.get(`user:${id}`) || await req.db.findOne(1, {id: id })

    // If from cache parse it from string
    if (typeof user === 'string') user = JSON.parse(user)

    // Admin check to prevent permission editing of administrator account
    if (user.username === 'admin') return res.status(401).json({message: "You cannot edit the administrator's permissions"})

    // Check if permission level is the same as previous permission level for user
    if (user.permissionLevel === permission) return res.status(400).json({message: 'Please specify a different permission level'})

    // Edit users permissions
    const data = await req.db.update(1, {id: id}, {permissionLevel: permission, verifiedNotification: true}, false)

    // Provide message and 200 status.
    res.status(200).header('location', '/admin').json({message: 'Successfully updated user'})

    // Check if permiossion level of user was unverified (0) and if there was no previous verified notification had been sent.
    if (data.permissionLevel === 0 && permission > 0 && !data.verifiedNotification) {
        mail.send('verified', {
            from: 'Item Inspection Support <noreply@xignotic.dev>',
            to: data.email, subject: 'Inspection account creation',
            text: "Your account has been verified \nYou can now login using this link: https://inspection.xignotic.dev"
        })
    }
})

Router.post('/user/:id/delete', async (req, res) => {
    const user = req.session.user

    if (user.id !== user.id || user.permissionLevel !== 3) res.status(401).json({message: "You do not have permission to delete this account"})

    await req.db.delete(1, {id: req.params.id}, `user:${req.params.id.id}`)

    res.header('location', '/admin').status(200).json({message: 'Successfully deleted an account'})
})

module.exports = Router

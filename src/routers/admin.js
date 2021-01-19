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
    if (req.session.user.id === req.params.id) {
        return res.status(403).json({message: "You cannot edit your own permissions"})
    }

    // Check if it is a number or not
    if (isNaN(req.params.permission)) return res.status(400).json({message: 'Invalid permission level, please refresh'})

    // Convert from string to number
    const permission = Number(req.params.permission)


    let user = await req.redis.get(`user:${id}`) || await req.db.findOne(1, {id: id })

    if (typeof user === 'string') user = JSON.parse(user)

    if (user.username === 'admin') return res.status(401).json({message: "You cannot edit the administrator's permissions"})

    if (user.permissionLevel === permission) return res.status(400).json({message: 'Please specify a different permission level'})

    // Edit users permissions
    const data = await req.db.update(1, {id: id}, {permissionLevel: permission, verifiedNotification: true}, false)

    res.status(200).header('location', '/admin').json({message: 'Successfully updated user'})

    if (data.permissionLevel === 0 && permission > 0 && !data.verifiedNotification) {
        mail.send('verified', {
            from: 'Item Inspection Support <noreply@xignotic.dev>',
            to: data.email, subject: 'Inspection account creation',
            text: "Your account has been verified \nYou can now login using this link: https://inspection.xignotic.dev"
        })
    }

    // Figure out a way to clear / edit the users session with new perms
})

module.exports = Router

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

Router.post('/permissions/:id', async (req, res) => {

    if (req.session.user.id === req.params.id) {
        return res.status(403).json({message: "You cannot edit your own permissions"})
    }

    // Edit users permissions
    req.db.update(1, {id: req.params.id}, {permissionLevel: req.body.permission}, false).then(val => {
        if (val.ok) {
            if (!val.nModified) return res.status(403).json({message: 'Please specify a different permission level'})
            res.status(200).json({message: 'Successfully updated user'})
        } else {
            res.status(500).json({message: 'There was an issue trying to update this user, try again. '})
        }
    })
    // Figure out a way to clear / edit the users session with new perms
})

module.exports = Router

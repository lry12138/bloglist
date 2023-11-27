const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/',async(request,response) => {
    const users = await User.find({}).populate('blogs', { url: 1, author:1,title: 1,})
    response.json(users)
})

usersRouter.post('/', async(request, response) => {
    const {username,name,password} = request.body
    const saltround = 10
    if(password.length <3){
        return response.status(400).json({error:'password need to be more than 3 characters'})
    }
    const hashedPassword = await bcrypt.hash(password,saltround)
    const user = new User({
        username:username,
        name:name,
        password:hashedPassword
    })
    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter
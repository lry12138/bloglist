const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async(request, response) => {
    const blogs = await Blog.find({}).populate('user',{ username: 1, name: 1 })
    response.json(blogs)
  })

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
      return authorization.replace('bearer ', '')
    }
    return null
  }
  
blogsRouter.post('/', async(request, response) => {
    const content = request.body
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
    const blog = new Blog({
      title: content.title,
      author: content.author,
      url: content.url,
      likes: content.likes || 0,
      user: user.id
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})
  
blogsRouter.delete('/:id',async(request, response) =>{
  const deletedBlog = await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id',(request,response)=>{
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url:body.url,
    likes: body.likes
  }
  Blog.findByIdAndUpdate(request.params.id,blog,{new: true, runValidators: true})
    .then(updatedBlog =>response.status(201).json(updatedBlog))
  
})

module.exports = blogsRouter
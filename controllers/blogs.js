const blogsRouter = require('express').Router()
const Blog = require('../models/blog')



blogsRouter.get('/', async(request, response) => {
    const blogs = await Blog.find({}).populate('user',{ username: 1, name: 1 })
    response.json(blogs)
  })


blogsRouter.post('/', async(request, response) => {
    const content = request.body
    const user = request.user
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
  const blogToDelet = await Blog.findById(request.params.id)
  const user = request.user
  if ( blogToDelet.user.toString() !== user.id) {
    response.status(401).json({ error: 'token invalid' })
  }
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
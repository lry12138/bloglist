const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')

beforeEach(async () => {
    await Blog.deleteMany({})
    console.log('cleared')
  
    for (let blog of helper.initialBlogs) {
        let blogObject = new Blog(blog)
        await blogObject.save()
      }
    console.log('done')
  })


test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)    
  })

test('blogs are identified by id', async () => {
    const response = await api.get('/api/blogs')

    expect(response).toBeDefined(response.id)
  })

test('blog can be added',async ()=>{
    const newBlog = ({
      title: "Update",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/08/Update.html",
      likes: 2
    })

    await api.post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type',/application\/json/)
    
    const currBlogs = await helper.blogsIndb()
    expect(currBlogs).toHaveLength(helper.initialBlogs.length + 1)
    
    const ids = await currBlogs.map(blog=>blog.ids)
    expect(ids).toContain(newBlog.id)

})

test('likes are defaulted to 0', async()=>{
    const newBlog = ({
        title: "Update",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/08/Update.html"
      })
  
      await api.post('/api/blogs')
              .send(newBlog)
              .expect(201)
              .expect('Content-Type',/application\/json/)
      
      const currBlogs = await helper.blogsIndb()
      expect(currBlogs).toHaveLength(helper.initialBlogs.length + 1)
      expect(currBlogs).toBeDefined(currBlogs.likes)
      expect(currBlogs[currBlogs.length-1].likes).toEqual(0)
      
})

test('blogs need a title', async()=>{
    const newBlog = ({
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/08/Update.html"
      })
  
    await api.post('/api/blogs')
        .send(newBlog)
        .expect(400)
    const currBlogs = await helper.blogsIndb()
    expect(currBlogs).toHaveLength(helper.initialBlogs.length )
})

test('blogs need a url', async()=>{
    const newBlog = ({
        title: "Update",
        author: "Robert C. Martin",
      })
  
    await api.post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const currBlogs = await helper.blogsIndb()
    expect(currBlogs).toHaveLength(helper.initialBlogs.length )
})

test ('blogs can be deleted',async()=>{
    const blogsAtStart = await helper.blogsIndb()
    const blogToDelet = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelet.id}`)
            .expect(204)

    const currBlogs = await helper.blogsIndb()
    expect(currBlogs).toHaveLength(helper.initialBlogs.length-1)

    const ids = await currBlogs.map(blog=>blog.ids)
    expect(ids).not.toContain(blogToDelet.id)
})

test ('blogs can be updated', async () => {
    const blogsAtStart = await helper.blogsIndb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = ({
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes+1
    })
        
    await api.put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(201)
            .expect('Content-Type',/application\/json/)

    const currBlogs = await helper.blogsIndb()
    expect(currBlogs).toHaveLength(helper.initialBlogs.length)
    console.log(currBlogs)
    expect(currBlogs[0].likes).toEqual(updatedBlog.likes)
})

describe('test add user function,initally one user in db',()=>{
  beforeEach(async()=>{
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'user1',password: passwordHash })

    await user.save()
  })

  test('user with an unique username can be added', async () => {
    const usersAtStart = await helper.usersIndb()

    const newUser = {
      username: 'user2',
      name: 'user2',
      password: 'password',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersIndb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('user with an repeated username can\'t be added', async () => {
    const usersAtStart = await helper.usersIndb()

    const newUser = {
      username: 'user1',
      name: 'user1',
      password: 'password',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('expected `username` to be unique')
    const usersAtEnd = await helper.usersIndb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length )
  })

  test('new user need a username', async () => {
    const usersAtStart = await helper.usersIndb()

    const newUser = {
      username: '',
      name: 'user2',
      password: 'password',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('Path `username` is required')

    const usersAtEnd = await helper.usersIndb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('new user need a password', async () => {
    const usersAtStart = await helper.usersIndb()

    const newUser = {
      username: 'user2',
      name: 'user2',
      password: '',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('Path `password` is required')

    const usersAtEnd = await helper.usersIndb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('password need to be more than 3 characters', async () => {
    const usersAtStart = await helper.usersIndb()

    const newUser = {
      username: 'user2',
      name: 'user2',
      password: '12',
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('password need to be more than 3 characters')

    const usersAtEnd = await helper.usersIndb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

})
afterAll(async () => {
    await mongoose.connection.close()
  })
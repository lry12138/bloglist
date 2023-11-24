var _ = require('lodash')

const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) =>{
    let total = 0
    blogs.forEach(blog => total += blog.likes)
    return total
}
const favoriteBlog =(blogs) =>{
    let fav = null
    for (const blog of blogs){
      if (fav == null){
        fav = {
          title: blog.title,
          author: blog.author,
          likes: blog.likes
        }
      }
      else if (fav.likes < blog.likes){
        fav = {
          title: blog.title,
          author: blog.author,
          likes: blog.likes
        }
      }
    }
    return fav
  }
const mostBlogs = (blogs)=>{
  if (blogs.length === 0){
    return null
  }
  const blogCount = _(blogs)
                    .countBy('author')
                    .map((blogs,author) => ({ blogs, author }))
                    .maxBy('blogs')
  return (blogCount)
}

const mostLikes = (blogs)=>{
  if (blogs.length === 0){
    return null
  }
  const likeCount =_(blogs)
                    .groupBy('author')
                    .mapValues(entries => _.sumBy(entries, 'likes'))
                    .map((likes, author) => ({ likes, author }))
                    .maxBy('likes') // Ends chain and returns unwrapped object

  return likeCount
 
}


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }

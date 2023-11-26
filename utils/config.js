require('dotenv').config()

const PORT = process.env.PORT
const mongoUrl = process.env.NODE_ENV === 'test'
                ?process.env.testMongoUrl
                :process.env.mongoUrl

module.exports ={
    PORT,
    mongoUrl
}
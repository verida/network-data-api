import express from 'express'
const cors = require('cors')
import bodyParser from 'body-parser'
import router from './routes'

// Set up the express app
const app = express()

// Parse incoming requests data
const corsConfig = {}
app.use(cors(corsConfig))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(router)

module.exports=app
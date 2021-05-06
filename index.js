require("dotenv").config()
const express = require("express")
const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

require('./routes/web')(app)

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`express server listening on port ${PORT}`)
})
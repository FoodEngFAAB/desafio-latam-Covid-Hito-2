const express = require('express')
const app = express()
var cors = require('cors')
const countries = require('./countries.json')
const usaDaily = require('./usa_daily.json')
const { validateToken, authorize } = require('./utils')

app.use(cors())
app.listen(3000, console.log("Servidor encendido 🟢"))
app.use(express.json())

app.get("/api/total", (req, res) => {
    res.json(countries)
})

app.post('/api/login', authorize)

app.get("/api/countries/USA", validateToken, (req, res) => {
    res.json(usaDaily)
})
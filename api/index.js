const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const cors = require('@koa/cors')

app.use(bodyParser())
app.use(cors())

const badge = require('./badge')
app.use(badge.routes())

app.listen(3000)
console.log('API Running')

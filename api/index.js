const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')

app.use(bodyParser())

const repo = require('./repo')
app.use(repo.routes())

const badge = require('./badge')
app.use(badge.routes())

app.listen(3000)
console.log('API Running')

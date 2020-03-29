const router = require('koa-router')({ prefix: '/api/repo' })
const { getRepo } = require('./github')
const { URL } = require('url')

router.post('/', async ctx => {
  let { pathname } = new URL(ctx.request.body.url)
  pathname = pathname.substr(1, pathname.length)
  ctx.body = await getRepo(pathname)
})

module.exports = router

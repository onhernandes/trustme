const router = require('koa-router')({ prefix: '/badge' })
const { getRepo, getLatestCommit, getPullRequests } = require('./github')

router.get('/:username/:repo', async ctx => {
  const pathname = `${ctx.params.username}/${ctx.params.repo}`
  let {
    commits_url: commitsUrl,
    ...repo
  } = await getRepo(pathname)

  if (ctx.query.s) {
    ctx.body = repo
    return
  }

  ctx.body = {
    schemaVersion: 1,
    label: 'trustme',
    message: 'Updated recently',
    color: 'green'
  }

  commitsUrl = commitsUrl.replace('{/sha}', '')
  console.log(commitsUrl)
  const { commit } = await getLatestCommit(commitsUrl)
  const commitDate = new Date(commit.author.date)
  const aWeekAgo = new Date()
  aWeekAgo.setDate(aWeekAgo.getDate() - 7)

  if (commitDate < aWeekAgo) {
    ctx.body.message = 'last updated a week ago'
    ctx.body.color = 'orange'
    return
  }
})

module.exports = router

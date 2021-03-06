const router = require('koa-router')({ prefix: '/badge' })
const { getRepo, getCommits } = require('./github')

router.get('/:username/:repo', async ctx => {
  const pathname = `${ctx.params.username}/${ctx.params.repo}`
  let {
    commits_url: commitsUrl,
    ...repo
  } = await getRepo(pathname)

  ctx.body = {
    schemaVersion: 1,
    label: 'trustme',
    message: 'updated recently',
    color: 'green'
  }

  if (repo.archived) {
    ctx.body.isError = true
    ctx.body.message = 'archived'
    ctx.body.color = 'black'
    return
  }

  if (repo.disabled) {
    ctx.body.isError = true
    ctx.body.message = 'disabled'
    ctx.body.color = 'black'
    return
  }

  commitsUrl = commitsUrl.replace('{/sha}', '')
  const { latestCommit } = await getCommits(commitsUrl)
  const commitDate = new Date(latestCommit.commit.author.date)
  const aWeekAgo = new Date()
  aWeekAgo.setDate(aWeekAgo.getDate() - 7)

  if (commitDate < aWeekAgo) {
    ctx.body.isError = true
    ctx.body.message = 'updated a week ago or more'
    ctx.body.color = 'orange'
  }
})

module.exports = router

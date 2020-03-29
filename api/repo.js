const router = require('koa-router')({ prefix: '/api/repo' })
const { getRepo, getCommits, getPullRequests, getIssues } = require('./github')

router.post('/', async ctx => {
  try {
    const repo = await getRepo(ctx.request.body.userRepo)
    const commitsUrl = repo.commits_url.replace('{/sha}', '?state=all')
    const { latestCommit } = await getCommits(commitsUrl)
    const pullRequestsUrl = repo.pulls_url.replace('{/number}', '?state=all')
    const pullRequests = await getPullRequests(pullRequestsUrl)
    const issuesUrl = repo.issues_url.replace('{/number}', '?state=all')
    const { lastClosedIssue } = await getIssues(issuesUrl)
    ctx.body = {
      stargazers: { count: repo.stargazers_count },
      forks: { count: repo.forks },
      openIssues: { count: repo.open_issues_count },
      lastClosedIssue: { date: lastClosedIssue ? lastClosedIssue.closed_at : null },
      license: { name: repo.license ? repo.license.name : null },
      archived: { status: repo.archived },
      disabled: { status: repo.disabled },
      language: { name: repo.language },
      totalOpenPullRequests: { count: pullRequests.all.filter(pr => pr.state === 'open').length },
      lastClosedPullRequest: { date: pullRequests.lastClosed ? pullRequests.lastClosed.updated_at : null },
      lastOpenedPullRequest: { date: pullRequests.lastOpened ? pullRequests.lastOpened.updated_at : null },
      latestCommit: { date: latestCommit ? latestCommit.commit.author.date : null },
      allPr: pullRequests.all
    }
  } catch (e) {
    console.error(e)
    ctx.body = e
  }
})

module.exports = router

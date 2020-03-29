<template>
  <div class="columns">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css" type="text/css">

    <div class="column is-three-fifths is-offset-one-fifth">
      <div class="columns">
        <div class="column">
          <div class="disclaimer">
            <h1 class="title">Trustme - let's know if you should trust that lib!</h1>
            <span class="name">
              How does this works? We analyze a repository on Github and set some rules to decide if some lib should be used or not.
            </span>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">URL</label>
            <div class="control">
              <input
                :class="['input', isDanger]"
                type="url"
                v-model="url"
                @keyup.enter="validateBeforeCalling"
                @input="validateBeforeCalling"
                placeholder="Either put a URL or username/repo"
              >
            </div>
          </div>
        </div>
      </div>

      <div class="columns" v-show="rules.length > 0">
        <div class="column">
          <h2 class="subtitle">What we found out...</h2>
          <ul class="rules">
            <li v-for="(rule, index) in rules" :key="index" :class="rule.color ? `is-${rule.color}` : ''">
              {{ rule.message }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRepo, getCommits, getPullRequests, getIssues } from '../api/github'
export default {
  name: 'App',
  data () {
    return {
      url: '',
      isDanger: '',
      timeout: null,
      rules: []
    }
  },
  methods: {
    validateBeforeCalling () {
      clearTimeout(this.timeout)
      this.timeout = null
      this.rules = []
      let isURL = false
      let isRepo = false
      let repo = null

      try {
        const url = new window.URL(this.url)
        isURL = true
        repo = url.pathname.substr(1, url.pathname.length)
      } catch (e) {
        isURL = false
      }

      if (!isURL) {
        const regexResult = this.url.match(/.+\/.+/g)
        isRepo = Array.isArray(regexResult)
        repo = this.url
        console.log({ regexResult })
      }

      if (!isURL && !isRepo) {
        this.isDanger = 'is-danger'
        return
      }

      this.isDanger = ''
      this.timeout = setTimeout(() => this.call(repo), 500)
    },
    async call (userRepo) {
      try {
        const repo = await getRepo(userRepo)
        const commitsUrl = repo.commits_url.replace('{/sha}', '?state=all')
        const { latestCommit } = await getCommits(commitsUrl)
        const pullRequestsUrl = repo.pulls_url.replace('{/number}', '?state=all')
        const pullRequests = await getPullRequests(pullRequestsUrl)
        const issuesUrl = repo.issues_url.replace('{/number}', '?state=all')
        const { lastClosedIssue } = await getIssues(issuesUrl)
        const rules = {
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
        this.applyRules(rules)
      } catch (e) {
        this.error = e
      }
    },
    applyRules (rules) {
      const formatDate = date => date
      const aWeekAgo = new Date()
      aWeekAgo.setDate(aWeekAgo.getDate() - 7)

      const aMonthAgo = new Date()
      aMonthAgo.setMonth(aMonthAgo.getMonth() - 1)

      const dict = {
        stargazers: ({ count }) => ({
          message: `Total of stargazers until now: ${count}`,
          color: count > 200 ? 'success' : (count > 100 ? 'warning' : 'danger')
        }),
        forks: ({ count }) => ({
          message: `Total of forks until now: ${count}`
        }),
        openIssues: ({ count }) => ({
          message: `Total of open issues until now: ${count}`,
          color: count > 10 ? 'success' : (count === 0 && !rules.lastClosedIssue.date ? 'danger' : undefined)
        }),
        lastClosedIssue: ({ date }) => ({
          message: date ? `Last closed issue were at ${formatDate(date)}` : 'Could not find last closed issue',
          color: !date && rules.openIssues === 0 ? 'danger' : undefined
        }),
        license: ({ name }) => ({
          message: name ? `License found: ${name}` : 'No license detected.',
          color: name ? 'success' : 'danger'
        }),
        archived: ({ status }) => ({
          message: status ? 'This repository is archived' : undefined,
          color: status ? 'danger' : undefined
        }),
        disabled: ({ status }) => ({
          message: status ? 'This repository is disabled' : undefined,
          color: status ? 'danger' : undefined
        }),
        language: ({ name }) => ({
          message: name ? `This repository is mainly written in ${name}` : undefined
        }),
        totalOpenPullRequests: ({ count }) => ({
          message: `Total of open pull requests ${count}`,
          color: count > 10 ? 'success' : undefined
        }),
        lastClosedPullRequest: ({ date }) => ({
          message: date ? `Last closed pull request were at ${formatDate(date)}` : 'We could not find last closed pull request',
          color: date > aWeekAgo ? 'success' : (date > aMonthAgo ? 'warning' : 'danger')
        }),
        lastOpenedPullRequest: ({ date }) => ({
          message: date ? `Last opened pull request were at ${formatDate(date)}` : 'We could not find last opened pull request',
          color: date > aWeekAgo ? 'success' : (date > aMonthAgo ? 'warning' : 'danger')
        }),
        latestCommit: ({ date }) => ({
          message: date ? `Latest commit were at ${formatDate(date)}` : 'No commits found',
          color: date ? (date > aWeekAgo ? 'success' : 'warning') : 'danger'
        })
      }

      Object
        .keys(rules)
        .forEach(ruleKey => {
          if (!dict.hasOwnProperty(ruleKey)) { // eslint-disable-line no-prototype-builtins
            return
          }

          const rule = rules[ruleKey]
          const ruleInfo = dict[ruleKey](rule)

          if (!ruleInfo.message) {
            return
          }

          this.rules.push(ruleInfo)
        })
    }
  }
}
</script>

<style>
.rules li {
  padding: 0.75rem;
  background-color: #fbfbfb;
}

.rules li.is-success {
  background-color: #95ff95;
}

.rules li.is-warning {
  background-color: #f9e465;
}

.rules li.is-danger {
  background-color: #fb7f7f;
}

.disclaimer {
  padding-top: 3rem;
  padding-bottom: 2rem;
  text-align: center;
}

* {
  box-sizing: border-box;
}
</style>

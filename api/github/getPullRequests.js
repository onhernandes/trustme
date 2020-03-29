const axios = require('axios')
module.exports = async apiUrl => {
  const { data } = await axios.get(apiUrl)

  return {
    totalPullRequests: data.length,
    lastOpenedPullRequest: data
      .filter(pr => pr.state === 'open')
      .sort((firstEl, secondEl) => firstEl.updated_at < secondEl.updated_at),
    pullRequests: data
  }
}

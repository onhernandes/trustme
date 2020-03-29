const axios = require('axios')
module.exports = async apiUrl => {
  const { data } = await axios.get(apiUrl)

  return {
    total: data.length,
    lastClosedIssue: data
      .filter(issue => issue.state === 'closed')
      .sort((firstEl, secondEl) => firstEl.updated_at < secondEl.updated_at)
      .shift(),
    all: data
  }
}

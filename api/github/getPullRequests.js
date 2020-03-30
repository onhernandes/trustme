const axios = require('axios')
module.exports = async apiUrl => {
  let data
  try {
    const response = await axios.get(apiUrl)
    data = response.data
  } catch (e) {
    console.error(e)
  }

  return {
    totalPullRequests: data.length,
    lastOpenedPullRequest: data
      .filter(pr => pr.state === 'open')
      .shift(),
    lastClosedPullRequest: data
      .filter(pr => pr.state === 'closed')
      .shift(),
    all: data
  }
}

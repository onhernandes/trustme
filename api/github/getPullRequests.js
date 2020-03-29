const axios = require('axios')
module.exports = async apiUrl => {
  let data
  try {
    const response = await axios.get(apiUrl)
    data = response.data
  } catch (e) {
    console.error(e)
  }

  console.log(
    data
      .filter(pr => pr.state === 'open')
      .sort((firstEl, secondEl) => new Date(firstEl.updated_at) < new Date(secondEl.updated_at))
      .shift().updated_at
  )
  return {
    totalPullRequests: data.length,
    lastOpenedPullRequest: data
      .filter(pr => pr.state === 'open')
      .sort((firstEl, secondEl) => new Date(firstEl.updated_at) < new Date(secondEl.updated_at))
      .shift(),
    lastClosedPullRequest: data,
    all: data
  }
}

const axios = require('axios')

module.exports = async (apiUrl) => {
  const { data } = await axios.get(apiUrl)

  return {
    commits: data,
    latestCommit: data[0]
  }
}

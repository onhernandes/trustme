const axios = require('axios')

module.exports = async (pathname) => {
  const base = 'https://api.github.com'
  const fullUrl = `${base}/repos/${pathname}`
  const { data } = await axios.get(fullUrl)
  return data
}

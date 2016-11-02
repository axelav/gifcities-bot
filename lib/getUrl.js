const nets = require('nets')
const random = require('random-item')

const ROOT = 'https://gifcities.archive.org/api/v1/gifsearch?q='
const PREFIX = 'https://web.archive.org/web/'

module.exports = getUrl

function getUrl (query, cb) {
  nets({
    url: ROOT + query,
    encoding: undefined
  }, (err, resp, body) => {
    if (err) console.error(err)

    const result = PREFIX + random(JSON.parse(body)).gif
    cb(result)
  })
}

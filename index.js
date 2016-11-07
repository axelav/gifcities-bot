const fs = require('fs')
const nets = require('nets')
const CronJob = require('cron').CronJob
const random = require('random-item')
const Twitter = require('twitter')
const tempWrite = require('temp-write')

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

const ROOT = 'https://gifcities.archive.org/api/v1/gifsearch?q='
const PREFIX = 'https://web.archive.org/web/'

try {
  new CronJob('0 0,15,30,45 * * * *', function () {
    init('lava lamp')
  }, null, true)
} catch(ex) {
    console.error("cron pattern not valid");
}

function init (query) {
  getImageUrl(query)
    .then(downloadImage)
    .then(postTweet)
}

function getImageUrl (query) {
  return new Promise((resolve, reject) => {
    nets({
      url: ROOT + query,
      encoding: undefined
    }, (err, res, body) => {
      if (err) return reject(err)

      const result = {
        url: PREFIX + random(JSON.parse(body)).gif,
        query: query
      }

      resolve(result)
    })
  })
}

function downloadImage (result) {
  return new Promise((resolve, reject) => {
    nets(result, (err, res, body) => {
      if (err) return reject(err)

      const nextResult = {
        filepath: tempWrite.sync(body),
        query: result.query
      }

      resolve(nextResult)
    })
  })
}

function postTweet (result) {
  const mediaType = 'image/gif'
  const mediaData = fs.readFileSync(result.filepath)
  const mediaSize = fs.statSync(result.filepath).size

  initUpload()
    .then(appendUpload)
    .then(finalizeUpload)
    .then(mediaId => {
      client.post('statuses/update', {
        status: result.query,
        media_ids: mediaId
      }, (err, tweet, res) => {
        if (err) return console.error('post ', err)

        console.log('success!')
      })
    })

  function initUpload () {
    return makePost('media/upload', {
      command: 'INIT',
      total_bytes: mediaSize,
      media_type: mediaType
    }).then(data => data.media_id_string, err => console.error('init ', err))
  }

  function appendUpload (mediaId) {
    return makePost('media/upload', {
      command: 'APPEND',
      media_id: mediaId,
      media: mediaData,
      segment_index: 0
    }).then(data => mediaId, err => console.error('append ', err))
  }

  function finalizeUpload (mediaId) {
    return makePost('media/upload', {
      command: 'FINALIZE',
      media_id: mediaId
    }).then(data => mediaId, err => console.error('finalize ', err))
  }

  function makePost (endpoint, params) {
    return new Promise((resolve, reject) => {
      client.post(endpoint, params, (err, data, resp) => {
        if (err) return reject(err)

        resolve(data)
      })
    })
  }
}

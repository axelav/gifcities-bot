const Twitter = require('twitter')
const getUrl = require('./lib/getUrl')

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

getUrl('ghosts', postTweet)

function postTweet (text) {
  client.post('statuses/update', { status: text }, (err, tweet, resp) => {
    if (err) throw err

    console.log('success!')
  })
}

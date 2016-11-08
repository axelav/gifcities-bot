const random = require('random-item')
const corpora = require('corpora-project')
const find = require('lodash.find')
const isObject = require('lodash.isobject')
const map = require('lodash.map')

const isArray = Array.isArray

module.exports = getQuery

function getQuery () {
  let category = random(corpora.getCategories())
  if (corpora.getCategories(category).length) {
    const subCategory = random(corpora.getCategories(category))
    category = category + '/' + subCategory
  }
  const files = corpora.getFiles(category)
  if (files.length) {
    const subject = random(files).name
    const file = corpora.getFile(category, subject)
    return findSubject(file, subject)
  }
}

function findSubject (file, subject) {
  let query
  if (!file[subject]) {
    if (isArray(file)) {
      query = random(file)
    } else {
      let options = find(file, x => isArray(x))

      if (!options || !options.length) {
        options = map(query)
      }
      query = random(options)
    }
  } else if (file[subject] && file[subject].length) {
    query = random(file[subject])
  } else {
    return getQuery()
  }

  return pickQueryFromObject(query)
}

function pickQueryFromObject (query) {
  if (isObject(query)) {
    let options = find(query, x => isArray(x))
    if (!options || !options.length) {
      options = map(query)
    }
    return random(options)
  }

  return query
}

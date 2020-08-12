const models = require('./models')
const redis = require('./redis')

const collections = {
  1: 'User'
}

module.exports = {
  async findOne(collection, id, cache = {key: false, bypass: false, timeout: process.env.REDIS_CACHE_TIME, set: true}) {
    let data

    const foundColl = models[collections[collection]] || models[collection]

    data = cache.key && !cache.bypass && await redis.get(cache.key) || await foundColl.findOne(id)

    // Check if data hasn't been cached, this will only be on the initial fetch from the database and then set it into cache
    if (typeof data !== 'string' && cache.set && cache.key) {
      // Stringify the data to cache
      data = JSON.stringify(data)

      redis.set(cache.key, data, 'EX', cache.timeout)
    }

    // Parse from cache (String to JSON)
    if (typeof data === 'string') data = JSON.parse(data)

    return data || false
  },

  async find(collection, id, cache = {key: false, bypass: false, timeout: process.env.REDIS_CACHE_TIME, set: true}) {
    let data

    const foundColl = models[collections[collection]] || models[collection]

    data = cache.key && !cache.bypass && await redis.get(cache.key) || await foundColl.find(id)

    // Check if data hasn't been cached, this will only be on the initial fetch from the database and then set it into cache
    if (typeof data !== 'string' && cache.set && cache.key) {
      // Stringify the data to cache
      data = JSON.stringify(data)

      redis.set(cache.key, data, 'EX', cache.timeout)
    }

    // Parse from cache (String to JSON)
    if (typeof data === 'string') data = JSON.parse(data)

    return data || false
  }
}
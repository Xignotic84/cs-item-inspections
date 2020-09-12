const models = require('./models')
const redis = require('./redis')

const collections = {
  1: 'user',
  2: 'group',
  3: 'quiz',
  4: 'submission'
}

module.exports = {
  async findOne(collection, id, cache = {key: false, bypass: false, timeout: process.env.REDIS_CACHE_TIME, set: true}) {
    let data

    const foundColl = models[collections[collection]] || models[collection]

    if (!foundColl) throw new Error('Invalid collection passed with function findOne()')

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

      redis.set(cache.key.replace('-ID', data.id), data, 'EX', cache.timeout)
    }

    // Parse from cache (String to JSON)
    if (typeof data === 'string') data = JSON.parse(data)

    return data || false
  },

  async create (collection, data) {
    const foundColl = models[collections[collection]] || models[collection]

    if (!data) throw new Error(`No data was provided on create function`)

    const _data = new foundColl(data)
    _data.save()

    return _data
  },

  async getUser(username) {
    return this.findOne(1, {$or: [{'username': username}, {'email': username}]});
  }
}
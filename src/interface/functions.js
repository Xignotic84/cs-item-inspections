const models = require('./models')
const redis = require('./redis')

const collections = {
    1: 'user',
    2: 'member',
    3: 'group',
    4: 'quiz',
    5: 'submission'
}


module.exports = {
    async handleCache(cache, data) {
        if (!data || !cache.key || typeof data === 'string') return false
        const cached = await redis.get(cache.key)
        if (cached) return false

        if (typeof data !== 'string' && cache.key) {
            // Stringify the data to cache
            const id = data.id
            data = JSON.stringify(data)

            redis.set(cache.key.replace('-ID', id), data, 'EX', cache.timeout || process.env.REDIS_CACHE_TIME)
        }
        return true
    },

    async findOne(collection, id, cache = {
        set: true,
        key: false,
        bypass: false,
        timeout: process.env.REDIS_CACHE_TIME
    }) {
        let data

        const foundColl = models[collections[collection]] || models[collection]

        if (!foundColl) throw new Error('Invalid collection passed with function findOne()')

        data = cache.key && !cache.bypass && await redis.get(cache.key) || await foundColl.findOne(id).lean()

        // Check if data hasn't been cached, this will only be on the initial fetch from the database and then set it into cache
        await this.handleCache(cache, data)

        // Parse from cache (String to JSON)
        if (typeof data === 'string') data = JSON.parse(data)

        return data || false
    },

    async find(collection, id, cache = {key: false, bypass: false, timeout: process.env.REDIS_CACHE_TIME, set: true}) {
        let data

        const foundColl = models[collections[collection]] || models[collection]

        data = cache.key && !cache.bypass && await redis.get(cache.key) || await foundColl.find(id).lean()

        // Check if data hasn't been cached, this will only be on the initial fetch from the database and then set it into cache
        await this.handleCache(cache, data)

        // Parse from cache (String to JSON)
        if (typeof data === 'string') data = JSON.parse(data)

        return data || false
    },

    async create(collection, data) {
        const foundColl = models[collections[collection]] || models[collection]

        if (!data) throw new Error(`No data was provided on create function`)

        const _data = new foundColl(data)
        _data.save()

        return _data
    },

    async update(collection, id, data, cache_id) {
        const foundColl = models[collections[collection]] || models[collection]

        if (!data) throw new Error(`No data was provided on update function`)

        const _data = await foundColl.updateOne(id, data)

        if (cache_id) redis.del(cache_id)

        return _data
    },

    async delete(collection, id, cache_id) {
        const foundColl = models[collections[collection]] || models[collection]

        const del = await foundColl.findOneAndDelete(id)

        if (cache_id) await redis.del(cache_id)

        return del
    },

    async deleteMany(collection, id, cache_id) {
        const foundColl = models[collections[collection]] || models[collection]

        const del = await foundColl.deleteMany(id)

        if (cache_id) await redis.del(cache_id)

        return del

    },

    async getUser(username, email) {
        return this.findOne(1, {$or: [{'username': username}, {'email': email}]}, {key: `user:-ID`});
    }
}
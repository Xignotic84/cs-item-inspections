const redis = require('redis');
const {promisify} = require('util');

const client = redis.createClient();

['get', 'set', 'del', 'ttl'].forEach(command => {
  client[command] = promisify(client[command]).bind(client)
});

module.exports = client;
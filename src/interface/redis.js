const redis = require('redis');
const {promisify} = require('util');

// Create redis client
const client = redis.createClient({db: 1});

// Promisify redis commands so that they can be used asynchronously
['get', 'set', 'del', 'ttl'].forEach(command => {
  client[command] = promisify(client[command]).bind(client)
});

module.exports = client;
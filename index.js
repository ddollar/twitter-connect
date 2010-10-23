var exports = module.exports;

exports.version = JSON.parse(require('fs').readFileSync(__dirname + '/package.json')).version;

var Client = require('./lib/client');

exports.createClient = function(consumerKey, consumerSecret) {
  return new Client(consumerKey, consumerSecret);
}

# twitter-connect

Twitter client meant to be used with connect apps.

## Installation

    $ npm install twitter-connect


## Usage

    var twitter = require('twitter-connect').createClient({
      consumerKey:    'consumer_key_here',
      consumerSecret: 'consumer_secret_here'
    });

    app.get('/test', function(request, response) {
      twitter.authorize(request, response, function(error, api) {
        api.get('/account/verify_credentials.json', function(error, data) {
          response.send('DATA: ' + sys.inspect(data))
        });
      });
    });

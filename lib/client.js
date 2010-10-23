var OAuth = require('oauth').OAuth;
var URL   = require("url");

module.exports = function Client(options) {
  this.consumerKey    = options.consumerKey;
  this.consumerSecret = options.consumerSecret;

  var oAuth = new OAuth(
    'http://twitter.com/oauth/request_token',
    'http://twitter.com/oauth/access_token',
    this.consumerKey,
    this.consumerSecret,
    '1.0',
    null,
    'HMAC-SHA1',
    null,
    {
      'Accept':     '*/*',
      'Connection': 'close',
      'User-Agent': 'twitter.js ' + module.parent.version
    }
  );

  var API_BASE = 'http://api.twitter.com/1';

  var callbackWrapper = function(callback) {
    return function (error, data) {
      if (error) {
        callback(error);
      } else {
        try {
          callback(null, JSON.parse(data));
        } catch (error) {
          callback(error);
        }
      }
    };
  }

  var API = function(token) {
    return {
      token: token,

      get: function(path, params, callback) {
        oAuth.get(API_BASE + path, this.token.oauth_token, this.token.oauth_token_secret, params, null, callbackWrapper(callback));
      },

      post: function(path, params, callback) {
        oAuth.post(API_BASE + path, this.token.oauth_token, this.token.oauth_token_secret, params, null, callbackWrapper(calback));
      }
    }
  }

  this.authorize = function(request, response, callback) {
    var url = URL.parse(request.url, true);

    if (!request.session.auth) { request.session.auth = {} };

    request.session.auth.callback_url = 'http://' + request.headers.host + request.url;

    if (request.session.auth.token) {
      callback(null, new API(request.session.auth.token));
    } else if (url.query && url.query.oauth_token && request.session.auth.twitter_oauth_token_secret) {
      oAuth.getOAuthAccessToken(
        url.query.oauth_token,
        request.session.auth.twitter_oauth_token_secret,
        url.query.oauth_verifier,
        function (error, oauth_token, oauth_token_secret, params) {
          if (error) {
            callback(error);
          } else {
            request.session.auth.token = {
              oauth_token:        oauth_token,
              oauth_token_secret: oauth_token_secret
            };

            callback(error, new API(request.session.auth.token));
          }
        }
      );
    } else {
      oAuth._authorize_callback = request.session.auth.callback_url;

      oAuth.getOAuthRequestToken(
        function (error, oauth_token, oauth_token_secret, oauth_authorize_url, params) {
          if (error) {
            callback(error);
          } else {
            request.session.twitter_redirect_url            = request.url;
            request.session.auth.twitter_oauth_token_secret = oauth_token_secret;
            request.session.auth.twitter_oauth_token        = oauth_token;
            response.redirect('http://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
          }
        }
      );
    }
  };
}

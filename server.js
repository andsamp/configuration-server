var http = require('http');//TODO: https
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var us = require('./lib/userService');
var cs = require('./lib/configurationService');
var rh = require('./lib/responseHandler');

var sessionTokens = {};

// var options = {
//   key: fs.readFileSync('resource/key.pem'),
//   cert: fs.readFileSync('resource/cert.pem')
// };

var srvr = new http.Server();
srvr.listen(8181, function() {
  console.log("INFO: Server listening on port 8181");
});

srvr.on('request', function(request, response) {
  try {
    var authToken = request.headers['x-configurations-authorization'];
    var path = url.parse(request.url).pathname.split('/');
    var searchParams = getSearchParams(request.url);
    var bodyString = '';

    request.on('data', function(chunk) {
      bodyString += chunk.toString()
    });

    request.on('end', function() {

      var bodyJson = createBodyJson(response, bodyString);
      if (path[1] == 'configurations' ) {
        if (verifyAuthToken(authToken)) {
          if (request.method == 'GET') {
            cs.getConfigurations(path[2], searchParams, response);
          } else if ( request.method == 'POST') {
            if (bodyJson) {
              cs.createConfiguration(bodyJson, response)
            } else {
              rh.handle400(response);
            }
          } else if ( request.method == 'PUT') {
            if (path[2] && bodyJson) {
              cs.modifyConfiguration(path[2], bodyJson, response)
            } else {
              rh.handle400(response);
            }
          } else if (request.method == 'DELETE') {
            if (path[2]) {
              cs.deleteConfiguration(path[2], response);
            } else {
              rh.handle400(response);
            }
          }
        } else {
          rh.handlePlainTextResponse(response, 403, 'Unauthorized access')
          console.log('WARN: unauthorized access attempt from: %s.', request.connection.remoteAddress)
        }

      } else if (path[1] == 'login') {

        if (request.method == 'POST') {
          if (bodyJson.username && bodyJson.password) {
            us.login(bodyJson.username, bodyJson.password, sessionTokens, response);
          } else {
            rh.handle400(response);
          }
        } else if (request.method == 'DELETE') {
          if (path[2]) {
            us.logout(path[2], sessionTokens, response);
          } else {
            rh.handle400(response);
          }
        }

      } else if (path[1] == 'logout' && request.method == 'POST') {

      } else {
        rh.handle404(response);
      }
    });
  } catch(e) {
    handlePlainTextResponse(response, 500, 'Server error occurred.');
    console.error('Server errror occurred.');
    console.error(request);
    console.error(e);
  }
});

function createBodyJson(response, bodyString) {
  var bodyJson = {};
  if (bodyString){
    try {
      bodyJson = JSON.parse(bodyString.toString());
    } catch(e) {
      rh.handlePlainTextResponse(response, 400, 'malformed content.');
      console.error('Failed to parse request body to JSON; %s', bodyString);
    }
  }
  return bodyJson;
}

function getSearchParams(uri) {
  var params = {};
  var searchString = url.parse(uri.toLowerCase()).query
  if (searchString) {
    params = qs.parse(searchString);
  }
  return params;
}

function verifyAuthToken(token) {
  var verified = false;
  if (token && token in sessionTokens) {
    var now = new Date();
    var expires = sessionTokens[token];

    if (now <= expires) {
      verified = true;
      sessionTokens[token] = us.calculateExpiry(now);
    } else {
      delete sessionTokens[token];
    }
  }
  return verified;
}

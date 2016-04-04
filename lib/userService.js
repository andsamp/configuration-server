var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var rh = require('./responseHandler');

const USERS_PATH = './resource/users.json'

function login(username, password, sessionTokens, response) {
  var successfulLogin = false;
  loadUsers(USERS_PATH, function(users) {
    for (var i in users) {
      if (users[i].username == username && users[i].hashedPassword == hashString(password)) {
        var token = createAuthToken(username, new Date());
        var expiry = calculateExpiry(new Date());
        sessionTokens[token] = expiry;
        successfulLogin = true;
      }
    }
    if (successfulLogin) {
      rh.handleJsonResponse(response, 200, JSON.stringify({'x-configurations-authorization': token}));
    } else {
      rh.handlePlainTextResponse(response, 401, 'Invalid Credentials.');
    }
  });
}
exports.login = login;

function logout(token, sessionTokens, response) {
  if (sessionTokens[token]) {
    delete sessionTokens[token];
    rh.handlePlainTextResponse(response, 200, 'OK');
  } else {
    rh.handle404(response);
  }
}
exports.logout = logout;

function hashString(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}
exports.hashString = hashString;

function calculateExpiry(date) {
  var expiry = new Date(date.getTime() + 600000);

  return expiry;
}
exports.calculateExpiry = calculateExpiry;

function createAuthToken(username, date) {
  var token = username + '|' + date.toString();

  return hashString(token);
}
exports.createAuthToken = createAuthToken;

function loadUsers(file, callback) {
  fs.exists(file, function(exists) {
    if (exists) {
      fs.readFile(file, 'utf8', function(err, data) {
        if(err) throw err;
        var data = data.toString();
        var users = JSON.parse(data || '[]');
        callback(users);
      });
    } else {
      console.log('WARN: Unable to load Users; %s does not exist. ', file)
      callback([]);
    }
  });
}
exports.loadUsers = loadUsers;

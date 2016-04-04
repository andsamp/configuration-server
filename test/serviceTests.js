var assert = require('assert');
var us = require('../lib/userService');
var cs = require('../lib/configurationService')

var usTestsCompleted = 0;
var csTestsCompleted = 0;

function createAuthTokenTest() {
  var expected = '20d7b9da6cf8fda6b1fac9d9fcda1e79';
  var username = 'blah';
  var date = new Date('March 29, 2016 03:24:00');
  var output = us.createAuthToken(username, date);

  assert.equal(output, expected, 'User token not correctly created; '+output+' != '+expected);
  usTestsCompleted++;
}

function hashStringTest() {
  var expected = '098f6bcd4621d373cade4e832627b4f6';
  var output = us.hashString('test');

  assert.equal(output, expected, 'String not hashed correctly created; '+output+' != '+expected);
  usTestsCompleted++;
}

function calculateExpiryTest() {
  var expected = new Date('March 29, 2016 04:04:00');
  var testDate = new Date('March 29, 2016 03:54:00');

  var output = us.calculateExpiry(testDate);
  assert.equal(output.toString(), expected.toString(), 'Expiration not calculated properly'+output.toString()+' != '+expected.toString());
  usTestsCompleted++;
}

function loadUsersNoFileTest() {
  var expected = [];
  us.loadUsers('blah', function(actual) {
    assert.equal(JSON.stringify(actual), JSON.stringify(expected), 'Invalid file did not return empty results; '+JSON.stringify(actual)+' != '+JSON.stringify(expected));
    usTestsCompleted++
  });


}

function loadUsersValidFileTest() {
  var expected = [{
    "username": "user1",
    "hashedPassword": "9ea4044dd92002f7f9e8c8bb5961f737"
  },{
    "username": "different.user",
    "hashedPassword": "ae455f02cad18504c9f01e24f5ad2b85"
  }];
  us.loadUsers('./test/resource/users.json', function(actual) {
      assert.equal(JSON.stringify(actual), JSON.stringify(expected), 'Valid file did not return expected results; '+JSON.stringify(actual)+' != '+JSON.stringify(expected));
      usTestsCompleted++
  });

}


createAuthTokenTest();
hashStringTest();
calculateExpiryTest();
loadUsersNoFileTest();
loadUsersValidFileTest();
console.log('Completed userService.js %s tests.', usTestsCompleted);

function compareConfigurationsBadSortParam() {
  var input = [{"name":"seven", "hostname":"blah.org", "port":5689, "username": "user8"},
  {"name":"eight", "hostname":"alpha.net", "port":1234, "username": "user7"},
  {"name":"hobbit", "hostname":"shire.nz", "port":5688, "username": "user71"},
  {"name":"rick", "hostname":"wubalubadubdub.com", "port":9999, "username": "sanchez"},
  {"name":"morty", "hostname":"rickstop.net", "port":8181, "username": "ihatesummer"},
  {"name":"anakin", "hostname":"darth.com", "port":7894, "username": "vader"},
  {"name":"chrissy", "hostname":"rollerderby.com", "port":4002, "username": "crusty"}]
  var expected = input;
  var actual = input.sort(function(a, b) {
    return cs.compareConfigurations(a, b, 'badparamname');
  });

  assert.equal(JSON.stringify(actual), JSON.stringify(expected), 'Bad sort param caused error');
  csTestsCompleted++;
}

function compareConfigurationsByName() {
  var input = [{"name":"seven", "hostname":"blah.org", "port":5689, "username": "user8"},
  {"name":"1", "hostname":"alpha.net", "port":1234, "username": "user7"},
  {"name":"hobbit", "hostname":"shire.nz", "port":5688, "username": "user71"},
  {"name":"rick", "hostname":"wubalubadubdub.com", "port":9999, "username": "sanchez"},
  {"name":"morty", "hostname":"C137.net", "port":8181, "username": "ihatesummer"},
  {"name":"anakin", "hostname":"darth.com", "port":7894, "username": "vader"},
  {"name":"chrissy", "hostname":"rollerderby.com", "port":4002, "username": "crusty"}];

  var expected = [{"name":"1", "hostname":"alpha.net", "port":1234, "username": "user7"},
  {"name":"anakin", "hostname":"darth.com", "port":7894, "username": "vader"},
  {"name":"chrissy", "hostname":"rollerderby.com", "port":4002, "username": "crusty"},
  {"name":"hobbit", "hostname":"shire.nz", "port":5688, "username": "user71"},
  {"name":"morty", "hostname":"C137.net", "port":8181, "username": "ihatesummer"},
  {"name":"rick", "hostname":"wubalubadubdub.com", "port":9999, "username": "sanchez"},
  {"name":"seven", "hostname":"blah.org", "port":5689, "username": "user8"}];
  var actual = input.sort(function(a, b) {
    return cs.compareConfigurations(a, b, 'name');
  });

  assert.equal(JSON.stringify(actual), JSON.stringify(expected), 'name sort param error; '+JSON.stringify(actual)+' != '+JSON.stringify(expected));
  csTestsCompleted++;
}

function compareConfigurationsByHostname() {
  var input = [{"name":"seven", "hostname":"blah.org", "port":5689, "username": "user8"},
  {"name":"1", "hostname":"alpha.net", "port":1234, "username": "user7"},
  {"name":"hobbit", "hostname":"shire.nz", "port":5688, "username": "user71"},
  {"name":"rick", "hostname":"wubalubadubdub.com", "port":9999, "username": "sanchez"},
  {"name":"morty", "hostname":"C137.net", "port":8181, "username": "ihatesummer"},
  {"name":"anakin", "hostname":"darth.com", "port":7894, "username": "vader"},
  {"name":"chrissy", "hostname":"rollerderby.com", "port":4002, "username": "crusty"}];

  var expected = [{"name":"morty", "hostname":"C137.net", "port":8181, "username": "ihatesummer"},
  {"name":"1", "hostname":"alpha.net", "port":1234, "username": "user7"},
  {"name":"seven", "hostname":"blah.org", "port":5689, "username": "user8"},
  {"name":"anakin", "hostname":"darth.com", "port":7894, "username": "vader"},
  {"name":"chrissy", "hostname":"rollerderby.com", "port":4002, "username": "crusty"},
  {"name":"hobbit", "hostname":"shire.nz", "port":5688, "username": "user71"},
  {"name":"rick", "hostname":"wubalubadubdub.com", "port":9999, "username": "sanchez"},
];
var actual = input.sort(function(a, b) {
  return cs.compareConfigurations(a, b, 'hostname');
});

assert.equal(JSON.stringify(actual), JSON.stringify(expected), 'hostname sort param error; '+JSON.stringify(actual)+' != '+JSON.stringify(expected));
csTestsCompleted++;
}

function compareConfigurationsByPort() {
  var input = [{"name":"seven", "hostname":"blah.org", "port":5689, "username": "user8"},
  {"name":"1", "hostname":"alpha.net", "port":1234, "username": "user7"},
  {"name":"hobbit", "hostname":"shire.nz", "port":5688, "username": "user71"},
  {"name":"rick", "hostname":"wubalubadubdub.com", "port":9999, "username": "sanchez"},
  {"name":"morty", "hostname":"C137.net", "port":8181, "username": "ihatesummer"},
  {"name":"anakin", "hostname":"darth.com", "port":7894, "username": "vader"},
  {"name":"chrissy", "hostname":"rollerderby.com", "port":4002, "username": "crusty"}];

  var expected = [{"name":"1", "hostname":"alpha.net", "port":1234, "username": "user7"},
  {"name":"chrissy", "hostname":"rollerderby.com", "port":4002, "username": "crusty"},
  {"name":"hobbit", "hostname":"shire.nz", "port":5688, "username": "user71"},
  {"name":"seven", "hostname":"blah.org", "port":5689, "username": "user8"},
  {"name":"anakin", "hostname":"darth.com", "port":7894, "username": "vader"},
  {"name":"morty", "hostname":"C137.net", "port":8181, "username": "ihatesummer"},
  {"name":"rick", "hostname":"wubalubadubdub.com", "port":9999, "username": "sanchez"},
];
var actual = input.sort(function(a, b) {
  return cs.compareConfigurations(a, b, 'port');
});

assert.equal(JSON.stringify(actual), JSON.stringify(expected), 'port sort param error; '+JSON.stringify(actual)+' != '+JSON.stringify(expected));
csTestsCompleted++;
}

function compareConfigurationsByusername() {
  var input = [{"name":"seven", "hostname":"blah.org", "port":5689, "username": "user8"},
  {"name":"1", "hostname":"alpha.net", "port":1234, "username": "user7"},
  {"name":"hobbit", "hostname":"shire.nz", "port":5688, "username": "user71"},
  {"name":"rick", "hostname":"wubalubadubdub.com", "port":9999, "username": "sanchez"},
  {"name":"morty", "hostname":"C137.net", "port":8181, "username": "ihatesummer"},
  {"name":"anakin", "hostname":"darth.com", "port":7894, "username": "vader"},
  {"name":"chrissy", "hostname":"rollerderby.com", "port":4002, "username": "crusty"}];

  var expected = [
    {"name":"chrissy", "hostname":"rollerderby.com", "port":4002, "username": "crusty"},
    {"name":"morty", "hostname":"C137.net", "port":8181, "username": "ihatesummer"},
    {"name":"1", "hostname":"alpha.net", "port":1234, "username": "user7"},
    {"name":"hobbit", "hostname":"shire.nz", "port":5688, "username": "user71"},
    {"name":"seven", "hostname":"blah.org", "port":5689, "username": "user8"},
    {"name":"anakin", "hostname":"darth.com", "port":7894, "username": "vader"},
    {"name":"rick", "hostname":"wubalubadubdub.com", "port":9999, "username": "sanchez"},
  ];
  var actual = input.sort(function(a, b) {
    return cs.compareConfigurations(a, b, 'username');
  });

  assert.equal(JSON.stringify(actual), JSON.stringify(actual), 'username sort param error');
  csTestsCompleted++;
}

function loadConfigurationsNoFileTest() {
  var expected = [];
  var actual;
  cs.loadConfigurations('hork', function(actual) {
    assert.equal(JSON.stringify(actual), JSON.stringify(expected), 'Valid file did not return expected results; '+JSON.stringify(actual)+' != '+JSON.stringify(expected));
    csTestsCompleted++;
  });


}

function loadConfigurationsValidFileTest() {
  var expected = [{"name":"host1","hostname":"ricks.lab.com","port":"9251","username":"user1"}];
  cs.loadConfigurations('./test/resource/configurations.json', function(actual) {
    assert.equal(JSON.stringify(actual), JSON.stringify(expected), 'Valid file did not return expected results; '+JSON.stringify(actual)+' != '+JSON.stringify(expected));
    csTestsCompleted++;
  });


}

compareConfigurationsBadSortParam();
compareConfigurationsByName();
compareConfigurationsByHostname();
compareConfigurationsByPort();
loadConfigurationsNoFileTest();
loadConfigurationsValidFileTest();
console.log('Completed configurationService.js %s tests.', csTestsCompleted);

var fs = require('fs');
var path = require('path');
var rh = require('./responseHandler');

const CONFIGURATIONS_PATH = './resource/configurations.json';
const DEF_PAGE_NUM = 0;
const DEF_PAGE_SIZE = 5;
const VALID_SORT_PARAMS = ['name', 'hostname', 'port', 'user'];

function getConfigurations(configName, searchParams, response) {
  loadConfigurations (CONFIGURATIONS_PATH, function(configurations) {
    var configsForView = configurations;
    console.log(configsForView.length);

    if (configName) {
      var index = findConfigurationIndexByName(configurations, configName);
      configsForView = index ? [configurations[index]] : [];
    }
    console.log(configsForView.length);
    if (configsForView.length > 1 && searchParams['sort'] && VALID_SORT_PARAMS.indexOf(searchParams['sort']) >= 0) {
      configsForView = configsForView.sort(function(a, b) {
        return compareConfigurations(a, b, searchParams['sort']);
      });
    }
    var pageNum = searchParams['pagenum'] ? searchParams['pagenum'] : DEF_PAGE_NUM;
    var pageSize = searchParams['pagesize'] ? searchParams['pagesize'] : DEF_PAGE_SIZE;
    var startIndex = pageSize * pageNum;
    var endIndex = startIndex + pageSize;

    configsForView = configsForView.slice(startIndex, endIndex);
    rh.handleJsonResponse(response, 200, JSON.stringify(configsForView));
  });
}
exports.getConfigurations = getConfigurations;

function createConfiguration(record, response) {
  record = createConfigurationRecord(record);
  loadConfigurations(CONFIGURATIONS_PATH, function(configurations) {
    var index = findConfigurationIndexByName(configurations, record.name);
    if(!index) {
      configurations.push(record);
      fs.writeFile(CONFIGURATIONS_PATH, JSON.stringify(configurations), 'utf8', function(error) {
        rh.handlePlainTextResponse(response, 500, 'Error while saving configurations');
        console.error('Error saving configuration. %s', error);
      });
      rh.handlePlainTextResponse(response, 201, 'OK.');
    } else {
      rh.handlePlainTextResponse(response, 409, 'Unable to create Configuration; a configuration with this name already exists.');
      console.log('WARN: Trying to create Configuration with a name that already exists');
    }
  });
}
exports.createConfiguration = createConfiguration;

function modifyConfiguration(name, record, response) {
  record = createConfigurationRecord(record);
  loadConfigurations('../resource/configurations.json', function(configurations) {
    var index = findConfigurationIndexByName(configurations, name);
    if (index) {
      configurations[index] = record
      fs.writeFile(CONFIGURATIONS_PATH, JSON.stringify(configurations), 'utf8', function(error) {
        rh.handlePlainTextResponse(response, 500, 'Error while saving configurations');
        console.error('error saving configuration. %s', error);
      });
      rh.handlePlainTextResponse(response, 200, 'OK.');
    } else {
      createConfiguration(record, response);
    }
  });
}
exports.modifyConfiguration = modifyConfiguration;

function deleteConfiguration(name, response) {
  loadConfigurations('../resource/configurations.json', function(configurations) {
    var index = findConfigurationIndexByName(configurations, name);
    if(index) {
      configurations.splice(index, 1);
      fs.writeFile(CONFIGURATIONS_PATH, JSON.stringify(configurations), 'utf8', function(error) {
        rh.handlePlainTextResponse(response, 500, 'Error while saving configurations');
        console.error('error saving configuration. %s', error);
      });
      rh.handlePlainTextResponse(response, 200, 'OK.');
    } else {
      rh.handle404(response);
    }
  });
}
exports.deleteConfiguration = deleteConfiguration;

function findConfigurationIndexByName(configurations, name) {
  var index = null;
  for (var i in configurations) {
    if(configurations[i].name == name) {
      index = i;
    }
  }
  return index;
}

function loadConfigurations(file, callback) {
  fs.exists(file, function(exists) {
    if (exists) {
      fs.readFile(file, 'utf8', function(err, data) {
        if(err) throw err;
        var data = data.toString();
        var configs = JSON.parse(data || '[]');
        callback(configs);
      });
    } else {
      console.log('WARN: Unable to load Configurations; %s does not exist. ', file)
      callback([]);
    }
  });
}
exports.loadConfigurations = loadConfigurations;

function compareConfigurations(a, b, property) {
  if(a[property] < b[property]) {
    return -1;
  } else if (a[property] > b[property]) {
    return 1;
  } else {
    return 0;
  }
}
exports.compareConfigurations = compareConfigurations;

function createConfigurationRecord(jsonBody) {
  var record = {};
  record.name = jsonBody.name ? jsonBody.name : null;
  record.hostname = jsonBody.hostname ? jsonBody.hostname : null;
  record.port = jsonBody.port ? jsonBody.port : null;
  record.username = jsonBody.username ? jsonBody.username : null;

  return record;
}

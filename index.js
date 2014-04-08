'use strict';
var Dropbox = require('dropbox');
var options;

var queue = {};

function addToDropboxQueue (message) {
  var token = message.token;
  var fileContent = message.file;
  var fileName = message.fileName;
  var saveObject = {
    timeout: setTimeout(function(){
      saveToDropBox(fileContent, fileName, token);
    }, options.delayTime)
  };
  if (queue[fileName]) {
    clearTimeout(queue[fileName].timeout);
  }
  queue[fileName] = saveObject;
}

function saveToDropBox (file, name, token) {
  var client = new Dropbox.Client({
    key: options.id,
    secret: options.secret,
    token: token // jshint ignore:line
  });

  client.writeFile(name, file, function (err) {
    if (err) {
      console.error(err);
    }
  });

}

function handleMessages(message) {
  if (message.file) {
    addToDropboxQueue(message);
  }
}

module.exports = function (config) {
  options = config;
  options.delayTime *= 1000;
  return handleMessages;
};

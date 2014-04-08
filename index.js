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
      process.send({
        error: err,
        user: user
      });
    }
  });

}

function handleMessages(message) {
  if (message.file) {
    addToDropboxQueue(message);
  } else
  if (message.config) {
    options = message.config;
    options.delayTime *= 1000;
  }
}

module.exports = handleMessages;

'use strict';
var Dropbox = require('dropbox');
var options;

var queue = {};

function addToDropboxQueue(message) {
  var id = message.fileName;
  if (!message.attempts) {
    message.attempts = 0;
  }

  if (message.attempts > options.maxAttempts) {
    console.error('Max attempts reached for', id);
    return;
  }

  var timeout = setTimeout(function saveToDropBoxWrapper() {
    saveToDropBox(message);
    delete queue[id];
  }, options.delayTime);

  if (queue[id]) {
    clearTimeout(queue[id]);
  }
  queue[id] = timeout;
}

function saveToDropBox(message) {
  var client = new Dropbox.Client({
    key: options.id,
    secret: options.secret,
    token: message.token
  });

  client.writeFile(message.fileName, message.file, function (err) {
    if (err) {
      message.attempts++;
      addToDropboxQueue(message);
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

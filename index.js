'use strict';
var Dropbox = require('dropbox');
var options;

var queue = {};

function addToDropboxQueue (message) {
  var user = message.user;
  var fileContent = message.file;
  var fileName = message.fileName;
  var saveObject = {
    file: fileContent,
    token: user.dropbox_token, // jshint ignore:line
    timeout: setTimeout(function(){
      saveToDropBox(fileContent, fileName, user);
    }, options.delayTime)
  };
  if (queue[fileName]) {
    clearTimeout(queue[fileName].timeout);
  }
  console.log('adding to queue');
  queue[fileName] = saveObject;
}

function saveToDropBox (file, name, user) {
  console.log('actually saving it now');
  var client = new Dropbox.Client({
    key: options.id,
    secret: options.secret,
    token: user.dropbox_token // jshint ignore:line
  });

  client.writeFile(name, file, function (err) {
    if (err) {
      process.send({
        error: err,
        user: user
      });
    }
    console.log('saved!');
  });

}

function handleMessages(message) {
  if (message.file) {
    console.log('recieved bin');
    addToDropboxQueue(message);
  } else
  if (message.options) {
    options = message.options;
    options.delayTime *= 1000;
  }
}

module.exports = function (socket) {
  socket.on('message', function (msg) {
    handleMessages(JSON.parse(msg.toString())); 
  });
};

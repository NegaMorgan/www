'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var http = require('http');
var Twitter = require('twitter');

/* jshint camelcase: false */
var config = {
  consumer_key: 'AuCTJJkwLGemXxxi2IPag',
  consumer_secret: '4IIpSfjPbvUNEN3scPogNVuC5Wbseabn2T97kRR1tms',
  access_token_key: '2296757942-WIkUaGQyHxHsSe6W4KsWnXStZo9Up6cw5LLqsQq',
  access_token_secret: 'esTngppPSimuksCGoeb3UUjkDtYawzgGy3adwiO6eP1tX'
};

var twitter = new Twitter(config);
var PHOTOS_PATH = path.join(__dirname, '..', 'public', 'images', 'speakers');

var image = module.exports;

function findImage(speaker, cb) {
  if (speaker.twitter) {
    var profile = speaker.twitter;
    twitter.get('/users/show.json', {screen_name: profile}, function (data) {
      data.profile_image_url ? cb(data.profile_image_url.replace('_normal','')) : cb(null);
    }); 
  }
}

function deleteFile(location, err) {
  if(err) { console.log(err.message); }
  fs.unlink(location);
}

image.saveFile = function(url, destination){
  var file = fs.createWriteStream(destination);
  
  http.get(url, function(response) {

    response.pipe(file);
    file.on('finish', function() {
      file.close();
    });
    file.on('error', function(err){
      deleteFile(destination, err);
    });
    
  }).on('error', function(err){
    deleteFile(destination, err);
  });
};

image.imagify = function(name) {
  // TODO is this always a jpg? find out
  return name.trim().toLowerCase().replace(' ', '') + '.jpg';
};

image.download = function(speaker) {
  var fname = image.imagify(speaker.name);
  var destination = path.join(PHOTOS_PATH, fname);
  findImage(speaker, function(response){
    if(response){
      image.saveFile(response, destination);
    }
  });
};

image.append = function(speaker) {
  // filename of image is
  var fname = image.imagify(speaker.name);
  
  if (!fs.existsSync(path.join(PHOTOS_PATH, fname))) { 
    image.download(speaker);
    return _.extend({ image: fname }, speaker); // TODO should only happen if download is successful
  } else { 
    return _.extend({ image: fname }, speaker); 
  }

  return speaker;
};

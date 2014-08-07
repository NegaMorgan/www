'use strict';

var mapRequire = require('map-require');
var _ = require('lodash');
var is = require('is-predicate');
var path = require('path');
var fs = require('fs');
var http = require('http');
var Twitter = require('twitter');

// TODO better organize all the things
var config = {
  consumer_key: 'AuCTJJkwLGemXxxi2IPag',
  consumer_secret: '4IIpSfjPbvUNEN3scPogNVuC5Wbseabn2T97kRR1tms',
  access_token_key: '2296757942-WIkUaGQyHxHsSe6W4KsWnXStZo9Up6cw5LLqsQq',
  access_token_secret: 'esTngppPSimuksCGoeb3UUjkDtYawzgGy3adwiO6eP1tX'
};

var twitter = new Twitter(config);
var PHOTOS_PATH = path.join(__dirname, '..', 'public', 'images', 'speakers');

function imagify(name) {
  // TODO is this always a jpg? find out
  return name.trim().toLowerCase().replace(' ', '') + '.jpg';
}

function saveFile(url, destination){
  var file = fs.createWriteStream(destination);
  var request = http.get(url, function(response) {
    try {
      response.pipe(file);
      file.on('finish', function() {
        file.close();
      });
    }
    catch(err) { console.log(err.message); }
  }).on('error', function(err) {
    fs.unlink(destination);
    console.log(err.message); // TODO better error handling
  });
}

function getPhoto(speaker) {
  var fname = imagify(speaker.name);
  var destination = path.join(PHOTOS_PATH, fname);

  // if the speaker has a twitter handle, try to 
  // get the profile_image_url and save the file
  if (speaker.twitter) {
    var profile = speaker.twitter;
    twitter.get('/users/show.json', {screen_name: profile}, function (data) {
      var imageURL = data.profile_image_url.replace('_normal','');
      saveFile(imageURL, destination);
    }); 
  }
}

function appendPhoto(speaker) {
  // filename of image is
  var fname = imagify(speaker.name);
  
  // TODO remove duplication
  if (!fs.existsSync(path.join(PHOTOS_PATH, fname))) { 
    getPhoto(speaker);
    return _.extend({ image: fname }, speaker); // TODO should only happen if getPhoto is successful
  } else { return _.extend({ image: fname }, speaker); }

  return speaker;
}

function map(meetup) {
  return _.defaults({
    speakers: meetup.speakers.map(appendPhoto)
  }, meetup);
}

var meetups = module.exports = mapRequire(path.join(__dirname, '..', 'speakers'), map);

// newest at the beginning
meetups.sort(function(a, b) {
  return is.less(a.date, b.date);
});

/**
 *  Finds the next meetup based on a given date
 *
 *  @param {Date} d
 *
 *  return {Object} - a meetup object
 */
meetups.findNext = function (d) {

  var found = _.find(meetups, function(meetup) {
    return ['getFullYear', 'getMonth'].every(function(fn) {
      return is.equal(meetup.date[fn](), d[fn]());
    });
  });

  if (!found) return null;

  // meetup is from the past, get next one by adding a month
  if (is.less(found.date.getDate(), d.getDate())) {
    return meetups[meetups.indexOf(found) - 1];
  }

  return found;
};

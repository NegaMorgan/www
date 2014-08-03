'use strict';

var mapRequire = require('map-require');
var _ = require('lodash');
var is = require('is-predicate');
var path = require('path');
var fs = require('fs');
var http = require('http');
var md5 = require('MD5');

var PHOTOS_PATH = path.join(__dirname, '..', 'public', 'images', 'speakers');

function imagify(name) {
  return name.trim().toLowerCase().replace(' ', '') + '.jpg';
}

function saveFile(url, destination){
  var file = fs.createWriteStream(destination);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
    });
  }).on('error', function(err) {
    fs.unlink(destination);
    console.log(err.message); // TODO better error handling
  });
}

function getPhoto(speaker) {
  // TODO add twitter support
  var fname = imagify(speaker.name);
  var destination = path.join(PHOTOS_PATH, fname);
  // gravatar needs speaker email addresses...
  var imageURL = 'http://www.gravatar.com/avatar/' + md5('matt@wordpress.com') + '?s=150';

  saveFile(imageURL, destination);
}

function appendPhoto(speaker) {
  // filename of image is
  var fname = imagify(speaker.name);
  
  // TODO remove duplication
  if (!fs.existsSync(path.join(PHOTOS_PATH, fname))) { 
    getPhoto(speaker);
  }
  if (fs.existsSync(path.join(PHOTOS_PATH, fname))) {
    return _.extend({ image: fname }, speaker);
  }

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

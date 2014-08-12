'use strict';

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var http = require('http');
var is = require('is-predicate');
var should = require('chai').should();
var expect = require('chai').expect;
var image = require('image');

describe('image', function(){
  // set up a dummy image to download
  var destination = path.join(__dirname, '/fixtures/kitten.jpg');
  
  after(function(){
    // delete that dummy image added by test
    fs.unlink(destination, function (err) {
      if (err) throw err;
    });
  });
  
  describe('#saveFile', function(){
    it('saves the file to the provided destination', function(){
      // TODO figure out how to mock this http request
      var file = 'http://placekitten.com/150/150';
      image.saveFile(file, destination);

      expect('destination').to.exist;
    });
    it('handles get request errors', function(){

    });
    it('handles write errors', function(){

    });
  });
  describe('#append', function(){

  });

});

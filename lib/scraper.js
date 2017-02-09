'use strict';
const async = require('async');
const request = require('supertest');
const url = require('url');

const models = require('../models');

const scrap = function scrap(endpoint, parser, options, cb) {

  async.waterfall([
    function loadHTML(cb) {
      var parsed = url.parse(endpoint);
      request(parsed.protocol + '//' + parsed.hostname)
        .get(parsed.pathname)
        .set({'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML,like Gecko) Chrome/40.0.2214.115 Safari/537.36'})
        //.expect(200)
        .end(cb);
    },
    function callParser(res, cb) {
      cb(null, parser(res.text));
    }
  ], cb);
}

module.exports = {
  scrap
};

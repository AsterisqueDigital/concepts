'use strict';

const async = require('async');

const models = require('../models');
const scraper = require('./scraper');
const emptyData = require('../config/empty-data');
const wikipediaHeadingParser = require('./parsers/wikipedia-heading');

var launch = function launch(cb) {

  async.waterfall([
    function init(cb) {
      async.each(emptyData, function(data, cb) {
        models.Node
          .findOrCreate({
            where: data,
          }).then(node => {
            cb(null, node)
          }).catch(cb);
      }, cb);
    },
    function getAllNodes(cb) {
      models.Node
        .findAll()
        .then(nodes => {
          cb(null, nodes)
        })
        .catch(cb)
    },
    function scrap(nodes, cb) {
      async.eachLimit(nodes, 3, function(node, cb) {
        scraper.scrap(node.source, wikipediaHeadingParser, {}, function(err, neighbors) {
          if(err) {
            return cb(err);
          }
          async.eachLimit(neighbors, 3, function(neighbor, cb) {
            async.waterfall([
              function createNode(cb) {
                models.Node.findOrCreate({
                  where: neighbor,
                }).nodeify(cb);
              },
              function createEdges(res, cb) {
                var neighborNode = res[0];
                models.Edge.new(node.id, neighborNode.id, cb);
              },
            ], cb);
          }, cb);
        });
      }, cb);
    },
  ], cb)
}

module.exports = {
  launch,
};

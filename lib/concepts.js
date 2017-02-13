'use strict';

const async = require('async');

const models = require('../models');
const scraper = require('./scraper');
const emptyData = require('../config/empty-data');
const wikipediaHeadingParser = require('./parsers/wikipedia-heading');

const maxDepth = 3;

/**
 * Recursive function to dig into the sources tree an create a concepts tree
 * @param  {integer}   depth  current depth
 * @param  {object}   nodes    current tree
 * @param  {Function} cb      callback
 */
var dig = function dig(depth, nodes, cb) {
  async.eachLimit(nodes, 1, function(node, cb) {
    scraper.scrap(node.source, wikipediaHeadingParser, {}, function(err, neighbors) {
      if(err) {
        return cb(err);
      }
      node.depth = depth;
      node.neighbors = neighbors;

      save(node, function(err) {
        if(err) {
          return cb(err);
        }
        if(node.depth > maxDepth) {
          return cb();    // we are deep enought, stop digging
        }

        dig(depth + 1, neighbors, function(err, subtree) {
          if(err) {
            return cb(err);
          }
          cb();
        });
      })
    });
  }, cb);
}

/**
 * Recursive function to save all nodes in the given tree
 * @param  {object}   node    the node
 * @param  {Function} cb      callback
 */
var save = function save(node, cb) {
  var neighbors = node.neighbors;
  delete node.neighbors;

  // loop in all neihhbors and save them + create the edge
  async.eachLimit(neighbors, 1, function(neighbor, cb) {
    neighbor.depth = node.depth + 1;
    async.waterfall([
      function findNode(cb) {
        models.Node.find({
          where: {
            name: neighbor.name,
          }
        }).nodeify(cb);
      },
      function createOrUpdate(existingNode, cb) {
        if (!existingNode) {
          models.Node
            .create(neighbor)
            .nodeify(cb);
        }
        else if(existingNode && (existingNode.hasOwnProperty('depth') || existingNode.depth > neighbor.depth)) {
          existingNode
            .update({depth: neighbor.depth})
            .nodeify((err, affectedCount, affecterRows) => {
              console.log(affectedCount, affecterRows, existingNode);
              cb(err, affecterRows[0]);
            });
        }
        else {
          cb(null, neighbor);
        }
      },
      function createEdges(neighborNode, cb) {
        models.Edge.new(node.id, neighborNode.id, cb);
      },
    ], cb);
  }, cb);
}

/**
 * Exported function, init database and launch the digging process
 * @param  {Function} cb callback
 */
var launch = function launch(cb) {
  async.waterfall([
    function init(cb) {
      async.each(emptyData, function(data, cb) {
        models.Node
          .findOrCreate({
            where: data,
          })
          .nodeify(cb);
      }, cb);
    },
    function getAllNodes(cb) {
      models.Node
        .findAll({
          where: {
            depth: 0,
          }
        })
        .nodeify(cb);
    },
    function launchDigger(nodes, cb) {
      dig(0, nodes, cb);
    },
  ], cb)
}

module.exports = {
  launch,
};

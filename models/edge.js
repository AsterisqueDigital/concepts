'use strict';

var SQL = require('sql-template-strings');

module.exports = function(sequelize, DataTypes) {
  var Edge = sequelize.define('Edge', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
  }, {
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function(models) {
        Edge.belongsTo(models.Node, {as: 'aNode', foreignKey: 'a_node'});
        Edge.belongsTo(models.Node, {as: 'bNode', foreignKey: 'b_node'});
      },
      new: function(firstNodeId, secondNodeId, cb) {
        sequelize.query(SQL`
          INSERT INTO "Edges" (a_node, b_node)
          VALUES (${firstNodeId}, ${secondNodeId}),
                 (${secondNodeId}, ${firstNodeId})
          ON CONFLICT DO NOTHING
        `).nodeify(cb);
      }
    },
    indexes: [
      {
        primary: true,
        unique: true,
        fields: ['a_node', 'b_node']
      },
    ],
  });
  return Edge;
};

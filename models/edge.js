'use strict';
module.exports = function(sequelize, DataTypes) {
  var Edge = sequelize.define('Edge', {
  }, {
    timestamps: false,
    underscored: true,
    classMethods: {
      associate: function(models) {
        Edge.belongsTo(models.Node, {as: 'aNode', foreignKey: 'a_node'});
        Edge.belongsTo(models.Node, {as: 'bNode', foreignKey: 'b_node'});
      }
    }
  });
  return Edge;
};

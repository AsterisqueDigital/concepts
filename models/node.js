'use strict';
module.exports = function(sequelize, DataTypes) {
  var Node = sequelize.define('Node', {
    name: DataTypes.STRING,
    source_name: DataTypes.STRING,
    french: DataTypes.STRING,
    german: DataTypes.STRING,
    spanish: DataTypes.STRING,
    portuguese: DataTypes.STRING,
    italian: DataTypes.STRING
  }, {
    underscored: true,
    classMethods: {
      associate: function(models) {
        Node.belongsToMany(models.Node, {as: 'neighbors', foreignKey: 'a_node', through: models.Edge});
        Node.belongsToMany(models.Node, {as: 'inversed', foreignKey: 'b_node', through: models.Edge});
      }
    }
  });
  return Node;
};

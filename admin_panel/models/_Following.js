module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('_Following', {
  }, {
    tableName: '_Following',
    
    timestamps: false,
    
  });

  Model.associate = (models) => {
    Model.belongsTo(models.User, {
      foreignKey: 'A',
      
      as: '_A',
    });
    
    Model.belongsTo(models.User, {
      foreignKey: 'B',
      
      as: '_B',
    });
    
  };

  return Model;
};


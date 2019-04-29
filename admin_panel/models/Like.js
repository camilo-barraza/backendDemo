module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Like', {
  }, {
    tableName: 'Like',
    
    timestamps: false,
    
  });

  Model.associate = (models) => {
    Model.belongsTo(models.User, {
      foreignKey: 'author',
      
      as: '_author',
    });
    
    Model.belongsTo(models.Comment, {
      foreignKey: 'comment',
      
      as: '_comment',
    });
    
  };

  return Model;
};


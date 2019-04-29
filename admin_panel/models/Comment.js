module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Comment', {
    'text': {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'Comment',
    
    timestamps: false,
    
  });

  Model.associate = (models) => {
    Model.belongsTo(models.Post, {
      foreignKey: 'post',
      
      as: '_post',
    });
    
    Model.belongsTo(models.User, {
      foreignKey: 'writtenBy',
      
      as: '_writtenBy',
    });
    
  };

  return Model;
};


module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Post', {
    'createdAt': {
      type: DataTypes.DATE,
    },
    'updatedAt': {
      type: DataTypes.DATE,
    },
    'title': {
      type: DataTypes.STRING,
    },
    'content': {
      type: DataTypes.STRING,
    },
    'published': {
      type: DataTypes.BOOLEAN,
    },
  }, {
    tableName: 'Post',
    
    
    
  });

  Model.associate = (models) => {
    Model.belongsTo(models.User, {
      foreignKey: 'author',
      
      as: '_author',
    });
    
  };

  return Model;
};


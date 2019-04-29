module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Goal', {
    'description': {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'Goal',
    
    timestamps: false,
    
  });

  Model.associate = (models) => {
    Model.belongsTo(models.User, {
      foreignKey: 'user',
      
      as: '_user',
    });
    
  };

  return Model;
};


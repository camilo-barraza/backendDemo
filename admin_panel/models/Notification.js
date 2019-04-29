module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('Notification', {
    'content': {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'Notification',
    
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


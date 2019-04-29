module.exports = (sequelize, DataTypes) => {
  const Model = sequelize.define('User', {
    'name': {
      type: DataTypes.STRING,
    },
    'email': {
      type: DataTypes.STRING,
    },
    'phoneNumber': {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'User',
    
    timestamps: false,
    
  });

  Model.associate = (models) => {
  };

  return Model;
};


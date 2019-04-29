const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
var cuid = require('cuid');

if (!process.env.DATABASE_URL) {
  console.error('Cannot connect to the database. Please declare the DATABASE_URL environment variable with the correct database connection string.');
  process.exit();
}

let databaseOptions = {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { maxConnections: 10, minConnections: 1 },
  dialectOptions: {}
};

if (process.env.SSL_DATABASE) {
  databaseOptions.dialectOptions.ssl = true;
}

if (process.env.ENCRYPT_DATABASE) {
  databaseOptions.dialectOptions.encrypt = true;
}

let sequelize = new Sequelize(process.env.DATABASE_URL, databaseOptions);
let db = {};

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function (file) {
    try {
      var model = sequelize['import'](path.join(__dirname, file));
      if(model.name !== "SequelizeMeta") {
        class Model extends sequelize.Model {}

        let attributes = {}
        Object.keys(model.attributes).forEach(key => {
          if(key !== 'id') {
            attributes[key] = {...model.attributes[key]}
          }
        })
        Model.init({
          id:{
            allowNull: false,
            primaryKey: true,
            type: sequelize.Sequelize.STRING(25),
            defaultValue: cuid
          },
          ...attributes
        }, { 
          sequelize , 
          modelName: model.name, 
          tableName:model.name, 
          timestamps:model._timestampAttributes.createdAt? true: false 
        })
        eval('Model.associate = '+ '(Model, '+ model.associate.toString().slice(1))
        if(model.name[0] === '_')
          Model.removeAttribute('id')
        db[model.name] = Model;
      }
    } catch (error) {
      console.error('Model creation error: ' + error);
    }
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName] && modelName[0] !== '_') {
    db[modelName].associate(db[modelName],db);
  }
});

// --------------- forms ----------------------

db.Post.attributes.published.defaultValue = false;
db.Post.attributes.author.allowNull = false;

// --------------- relations ----------------------
db.User.hasMany(db.Post, {foreignKey:'author'})
db.User.hasMany(db.Comment, {foreignKey:'writtenBy'})
db.Post.hasMany(db.Comment, {foreignKey:'post'}) ;
db.User.hasMany(db.Goal, {foreignKey:'user'}) ;
db.User.hasMany(db.Like, {foreignKey:'author'}) ;
db.User.hasMany(db.Notification, {foreignKey:'user'}) ;
db.Comment.hasMany(db.Like, {foreignKey:'comment'}) ;
db.User.belongsToMany(db.User, 
{
    as: 'Followers',
    through: db._Following,
    foreignKey: 'B',
    otherKey: 'A'
});
db.User.belongsToMany(db.User, 
{
    as: 'Following',
    through: db._Following,
    foreignKey: 'A',
    otherKey: 'B'
});

// -----------------------------------------------

db.sequelize = sequelize;
db.Sequelize = Sequelize;



module.exports = db;

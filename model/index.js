// models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: false, // Disable logging or provide a custom logging function
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import your models here
// db.User = require('./User')(sequelize, Sequelize);
module.exports = db;

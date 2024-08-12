module.exports = {
    development: {
      username: 'postgres',
      password: 'QQww12@@',
      database: 'postgres',
      host: '127.0.0.1',
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        // Additional options for your specific dialect can be set here
        // For example, for PostgreSQL you might set:
        // ssl: {
        //   require: true,
        //   rejectUnauthorized: false // Use this with caution for production
        // }
      },
      define: {
        // Global model settings
        timestamps: true, // Add createdAt and updatedAt timestamps to all models
        // underscored: true // Use snake_case column names instead of camelCase
      }
    },
    test: {
      username: 'your_username',
      password: 'your_password',
      database: 'your_test_database_name',
      host: '127.0.0.1',
      dialect: 'postgres',
    },
    production: {
      username: 'your_username',
      password: 'your_password',
      database: 'your_production_database_name',
      host: '127.0.0.1',
      dialect: 'postgres',
    },
  };
  
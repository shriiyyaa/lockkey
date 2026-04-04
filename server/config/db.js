const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false,
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'} Database connected`);
    
    // Auto-sync schema
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synchronized');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

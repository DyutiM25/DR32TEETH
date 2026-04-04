import { Sequelize } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';

const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL database connected successfully.');
    await sequelize.sync();
    console.log('All models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;
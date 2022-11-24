require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize;
sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    dialect: "postgres",
    operatorsAliases: false,
    logging: false,
    // operatorsAliases: 0,
  }
);

module.exports = sequelize;

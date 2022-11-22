require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.QOVERY_POSTGRESQL_ZEC72C406_DEFAULT_DATABASE_NAME,
  process.env.QOVERY_POSTGRESQL_ZEC72C406_LOGIN,
  process.env.QOVERY_POSTGRESQL_ZEC72C406_PASSWORD,
  {
    HOST: process.env.QOVERY_POSTGRESQL_ZEC72C406_HOST,
    PORT: process.env.QOVERY_POSTGRESQL_ZEC72C406_PORT,
    dialect: "postgres",
    operatorsAliases: false,
    logging: false,
    operatorsAliases: 0,
  }
);

module.exports = sequelize;

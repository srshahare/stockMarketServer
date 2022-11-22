require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize;
if (process.env.QOVERY_APPLICATION_ZCF658DA6_ENVIRONMENT_NAME === "production") {
  sequelize = new Sequelize(process.env.QOVERY_POSTGRESQL_ZEC72C406_DATABASE_URL)
} else {
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
      operatorsAliases: 0,
    }
  );
}

module.exports = sequelize;

require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize;
if (process.env.QOVERY_APPLICATION_Z36BEDFA6_ENVIRONMENT_NAME === "production") {
  sequelize = new Sequelize(process.env.QOVERY_POSTGRESQL_Z1A1E0E43_DATABASE_URL)
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
      ssl: true
      // operatorsAliases: 0,
    }
  );
}

module.exports = sequelize;

const Sequelize = require("sequelize")
const sequelize = require("../config/db.config")

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.snapshot = require("../models/snapshot.model")(sequelize, Sequelize)
db.option = require("./option.model")(sequelize, Sequelize)
db.sumVolume = require("./sumVolume.model")(sequelize, Sequelize)
db.expoAvg = require("./expoAverage.model")(sequelize, Sequelize)


module.exports = db;
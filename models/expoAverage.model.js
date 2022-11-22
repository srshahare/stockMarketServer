module.exports = (sequelize, Sequelize) => {
  const ExpoAverage = sequelize.define("expoAverage", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    timeStamp: {
      type: Sequelize.STRING,
      required: true,
    },
    exchangeName: {
      type: Sequelize.ENUM,
      values: ["NIFTY", "BANKNIFTY"],
      required: true,
    },
    futureIndex: {
      type: Sequelize.STRING,
      required: true,
    },
    interval: {
      type: Sequelize.ENUM,
      values: ["30", "60"],
      required: true,
    },
    duration: {
      type: Sequelize.ENUM,
      values: ["15", "30", "45", "60"],
      required: true,
    },
    chartType: {
        type: Sequelize.ENUM,
        values: ["STD", "PER"],
        required: true,
    },
    expoAvgData: {
      type: Sequelize.TEXT,
      get: function () {
        return JSON.parse(this.getDataValue("expoAvgData"));
      },
      set: function (val) {
        return this.setDataValue("expoAvgData", JSON.stringify(val));
      },
      required: true,
    },
  });

  return ExpoAverage;
};

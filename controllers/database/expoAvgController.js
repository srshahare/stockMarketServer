const { Op } = require("sequelize");
const db = require("../../models");
const moment = require("moment");
const product = require("../../constants/product");

const ExpoAvg = db.expoAvg;

module.exports = {
  saveExpoAvgData: async (
    expoItem,
    interval,
    duration,
    exchange,
    chartType
  ) => {
    try {
      const timestamp = parseInt(expoItem.tradeTime);
      const expoAvgData = JSON.stringify(expoItem);
      const data = {
        timeStamp: timestamp,
        exchangeName: exchange,
        futureIndex: exchange === product.NIFTY ? "NIFTY 50" : "BANK NIFTY",
        interval,
        duration: String(duration),
        chartType,
        expoAvgData,
      };
      const createdExpoAvg = await ExpoAvg.create(data);
      return createdExpoAvg;
    } catch (err) {
      console.log("Expo Avg Save Error", err.message);
    }
  },

  fetchLatestExpoAvgData: (exchange, interval, duration) => {
    return new Promise(async (resolve, reject) => {
      try {
        const month = moment().month();
        const date = moment().date();
        const year = moment().year();
        const beginTime = moment([year, month, date, 9, 15, 00, 00]);
        const expoAvgData = await ExpoAvg.findAndCountAll({
          where: {
            [Op.and]: [
              {
                createdAt: {
                  [Op.gte]: beginTime.toDate(),
                },
              },
              { exchangeName: exchange },
              { interval: interval },
              { duration: duration },
            ],
          },
          order: [["timeStamp", "DESC"]],
          limit: 800,
        });
        if (expoAvgData) {
          resolve(expoAvgData);
        } else {
          reject({
            status: 402,
            message: "Error in fetching the data",
          });
        }
      } catch (err) {
        reject({
          status: 500,
          message: err.message,
        });
        console.log(err);
      }
    });
  },

  fetchExpoAvgData: (exchange, interval, duration, timestamp) => {
    return new Promise(async (resolve, reject) => {
      try {
        let limit = 360;
        if (duration === "15") {
          limit = 360;
        } else if (duration === "30") {
          limit = 345;
        } else if (duration === "45") {
          limit = 330;
        } else {
          limit = 315;
        }
        const fromTime = timestamp;
        const toTime = timestamp + 22500;
        const expoAvgData = await ExpoAvg.findAll({
          where: {
            [Op.and]: [
              {
                timeStamp: {
                  [Op.gte]: fromTime,
                  [Op.lte]: toTime,
                },
              },
              { exchangeName: exchange },
              { interval: interval },
              { duration: duration },
            ],
          },
          order: [["timeStamp", "ASC"]],
          limit: limit,
        });
        if (expoAvgData) {
          resolve(expoAvgData);
        } else {
          reject({
            status: 402,
            message: "Error in fetching the data",
          });
        }
      } catch (err) {
        reject({
          status: 500,
          message: err.message,
        });
        console.log(err);
      }
    });
  },
};

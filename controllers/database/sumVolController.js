const moment = require("moment");
const { Op } = require("sequelize");
const product = require("../../constants/product");
const db = require("../../models");

const SumVolume = db.sumVolume;

module.exports = {
  saveSumVolumeData: async (volItem, interval, exchange) => {
    try {
      const timestamp = String(volItem.tradeTime);
      const volumeData = JSON.stringify(volItem);
      const data = {
        timeStamp: timestamp,
        exchangeName: exchange,
        futureIndex: exchange === product.NIFTY ? "NIFTY 50" : "NIFTY BANK",
        interval,
        volumeData,
      };
      const createdOption = await SumVolume.create(data);
      return createdOption;
    } catch (err) {
      console.log("Volume Save Error", err.message);
    }
  },

  fetchLatestVolumeData: (exchange, interval) => {
    return new Promise(async (resolve, reject) => {
      try {
        const month = moment().month();
        const date = moment().date();
        const year = moment().year();
        const beginTime = moment([year, month, date, 9, 15, 00, 00]);
        const volumeData = await SumVolume.findAndCountAll({
          where: {
            [Op.and]: [
              {
                createdAt: {
                  [Op.gte]: beginTime.toDate(),
                },
              },
              { exchangeName: exchange },
              { interval: interval },
            ],
          },
          order: [["timeStamp", "DESC"]],
          limit: 800,
        });
        if (volumeData) {
          resolve(volumeData);
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

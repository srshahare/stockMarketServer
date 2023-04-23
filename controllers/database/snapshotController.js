const { Op } = require("sequelize");
const product = require("../../constants/product");
const db = require("../../models");

const Snapshot = db.snapshot;

module.exports = {
  saveSnapshot: async (snapItem, interval, exchange) => {
    try {
      const timestamp = parseInt(snapItem.tradeTime);
      console.log("htllo", timestamp)

      const snapshotData = JSON.stringify(snapItem);
      const data = {
        timeStamp: timestamp,
        exchangeName: exchange,
        futureIndex: exchange === product.NIFTY ? "NIFTY 50" : "NIFTY BANK",
        interval,
        snapshotData,
      };
      const createdSnap = await Snapshot.create(data);
      return createdSnap;
    } catch (err) {
      console.log("Snapshot Save Error", err.message);
    }
  },

  fetchSnapshots: (exchange, interval, timestamp) => {
    return new Promise(async (resolve, reject) => {
      try {

        const fromTime = timestamp;
        const toTime = timestamp + 22500;

        const snapshotData = await Snapshot.findAll({
          where: {
            [Op.and]: [
              {
                timeStamp: {
                  [Op.gte]: fromTime,
                  [Op.lte]: toTime
                },
              },
              { exchangeName: exchange },
              { interval: interval },
            ],
          },
          order: [["timeStamp", "ASC"]],
          limit: 375,
        });
        if (snapshotData) {
          resolve(snapshotData);
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

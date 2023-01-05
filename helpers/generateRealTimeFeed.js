const product = require("../constants/product");
const moment = require("moment");
const { GetFutureHistory } = require("../listeners/socketManager");
const { socketInterval } = require("../constants/socketFlag");

module.exports = {
  generateFeed: (conn) => {
    const instrumentId1 = "NIFTY 50";
    // const instrumentId2 = generateInstrumentId(product.BANKNIFTY);
    const instrumentId2 = "NIFTY BANK";
    const month = moment().month();
    const date = moment().date();
    const year = moment().year();
    let fromTime = moment([year, month, date, 9, 15, 00, 00]).unix();

    setTimeout(() => {
      GetFutureHistory(
        conn,
        instrumentId1,
        fromTime,
        fromTime,
        "FutureHistory"
      );
      GetFutureHistory(
        conn,
        instrumentId2,
        fromTime,
        fromTime,
        "FutureHistory"
      );

      socketInterval.minuteInterval = setInterval(() => {
        fromTime = fromTime + 60;
        console.log("Minute Call, ", moment(fromTime).toDate());
        GetFutureHistory(
          conn,
          instrumentId1,
          fromTime,
          fromTime,
          "FutureHistory"
        );
        GetFutureHistory(
          conn,
          instrumentId2,
          fromTime,
          fromTime,
          "FutureHistory"
        );
      }, 30000); // wait for 60 sec
    }, 500); // wait until pipeline generated
  },
};

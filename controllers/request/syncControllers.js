const moment = require("moment");
const { GetFutureHistory } = require("../../listeners/socketManager");
const { socketFlag, socketInterval } = require("../../constants/socketFlag");

module.exports = {
  syncControllers: (conn, subscribe) => {
    let syncInterval;
    if (subscribe) {
      socketFlag.isSyncing = true;
      // generate future instrument identifier for NIFTY & BANKNIFTY
      // const instrumentId1 = generateInstrumentId(product.NIFTY);
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
      }, 100);
      setTimeout(() => {
        GetFutureHistory(
          conn,
          instrumentId2,
          fromTime,
          fromTime,
          "FutureHistory"
        );
      }, 100);
      // loop calls
      socketInterval.syncInterval = setInterval(() => {
        fromTime = fromTime + 60;
        setTimeout(() => {
          GetFutureHistory(
            conn,
            instrumentId1,
            fromTime,
            fromTime,
            "FutureHistory"
          );
          setTimeout(() => {
            GetFutureHistory(
              conn,
              instrumentId2,
              fromTime,
              fromTime,
              "FutureHistory"
            );
          }, 100);
        }, 200);
      }, 20000); // loop each 60 sec
    } else {
      clearInterval(socketInterval.syncInterval);
      socketFlag.isSyncing = false;
      console.log("Syncing has stopped!, ", moment().toDate());
    }
  },
};

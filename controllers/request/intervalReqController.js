const moment = require("moment");
const schedule = require("node-schedule");
const {
  generateInstrumentId,
} = require("../../helpers/instrument/instrumentHandler");
const {
  SubscribeSnapshot,
  GetFutureTickHistory,
  GetFutureHistory,
} = require("../../listeners/socketManager");
const {
  generatePipeline,
  generateTickPipeline,
} = require("../data/pipelineController");
const product = require("../../constants/product");
const {
  socketTickFlag,
  socketInterval,
  socketFlag,
} = require("../../constants/socketFlag");
const { syncControllers } = require("./syncControllers");

module.exports = {
  minuteReqController: (conn, wss) => {
    // generate future instrument identifier for NIFTY & BANKNIFTY
    // const instrumentId1 = generateInstrumentId(product.NIFTY);
    const instrumentId1 = "NIFTY 50";
    // const instrumentId2 = generateInstrumentId(product.BANKNIFTY);
    const instrumentId2 = "NIFTY BANK";
    const month = moment().month();
    const date = moment().date();
    const year = moment().year();
    let fromTime = moment([year, month, date, 9, 15, 00, 00]).unix();
    // create 2 pipeline for NIFTY(PE/CE) & BANKNIFTY(PE/CE)
    generatePipeline(conn, wss, product.NIFTY);
    generatePipeline(conn, wss, product.BANKNIFTY);

    

    setTimeout(() => {
      console.log("Data syncing initiated!")
      syncControllers(conn, true);
    }, 5000);

    setTimeout(() => {
      let checkInterval = setInterval(() => {
        if (!socketFlag.isSyncing) {
          console.log("subscribing to snapshots!");
          // subscribe for NIFTY
          // Todo : Uncomment for nifty snapshot data
          SubscribeSnapshot(conn, instrumentId1);
          // subscribe for BANKNIFTY
          // Todo : Uncomment for banknifty snapshot data
          SubscribeSnapshot(conn, instrumentId2);
          clearInterval(checkInterval);
        }
      }, 1000);
    }, 10000);

    // // subscribe for NIFTY & BANKNIFTY
    // // first time call
    // setTimeout(() => {
    //   GetFutureHistory(
    //     conn,
    //     instrumentId1,
    //     fromTime,
    //     fromTime,
    //     "FutureHistory"
    //   );
    // }, 1000);
    // setTimeout(() => {
    //   GetFutureHistory(
    //     conn,
    //     instrumentId2,
    //     fromTime,
    //     fromTime,
    //     "FutureHistory"
    //   );
    // }, 1000);
    // // loop calls
    // socketInterval.minuteInterval = setInterval(() => {
    //   fromTime = fromTime + 60;
    //   setTimeout(() => {
    //     GetFutureHistory(
    //       conn,
    //       instrumentId1,
    //       fromTime,
    //       fromTime,
    //       "FutureHistory"
    //     );
    //     setTimeout(() => {
    //       GetFutureHistory(
    //         conn,
    //         instrumentId2,
    //         fromTime,
    //         fromTime,
    //         "FutureHistory"
    //       );
    //     }, 500);
    //   }, 1000);
    // }, 3000); // loop each 60 sec
  },

  tickReqController: (conn, wss) => {
    // generate future instrument identifier for NIFTY & BANKNIFTY
    const instrumentId1 = "NIFTY 50";
    const instrumentId2 = "NIFTY BANK";
    const month = moment().month();
    const date = moment().date();
    const year = moment().year();
    let fromTime = moment([year, month, date, 9, 15, 00, 00]).unix();
    // create 2 tick pipeline for NIFTY(PE/CE) & BANKN IFTY(PE/CE)
    generateTickPipeline(conn, wss, product.NIFTY);
    generateTickPipeline(conn, wss, product.BANKNIFTY);

    // subscribe for NIFTY & BANKNIFTY
    // first time call
    setTimeout(() => {
      GetFutureTickHistory(
        conn,
        instrumentId1,
        fromTime,
        fromTime,
        "FutureHistory"
      );
    }, 1000);
    setTimeout(() => {
      GetFutureTickHistory(
        conn,
        instrumentId2,
        fromTime,
        fromTime,
        "FutureHistory"
      );
    }, 1000);
    // loop calls
    socketInterval.tickInterval = setInterval(() => {
      fromTime = fromTime + 30;
      setTimeout(() => {
        GetFutureTickHistory(
          conn,
          instrumentId1,
          fromTime,
          fromTime,
          "FutureHistory"
        );
        setTimeout(() => {
          GetFutureTickHistory(
            conn,
            instrumentId2,
            fromTime,
            fromTime,
            "FutureHistory"
          );
        }, 500);
      }, 1000);
    }, 30000); // loop each 30 sec
  },
};

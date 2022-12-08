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
const { dataTickListNifty } = require("../../helpers/queue/dataTickQueue");

module.exports = {
  minuteReqController: (conn, wss) => {
    // const instrumentId1 = generateInstrumentId(product.NIFTY);
    const instrumentId1 = "NIFTY 50";
    // const instrumentId2 = generateInstrumentId(product.BANKNIFTY);
    const instrumentId2 = "NIFTY BANK";
    const month = moment().month();
    const date = moment().date();
    const year = moment().year();
    let fromTime = moment([year, month, 08, 9, 15, 00, 00]).unix();

    // create 2 pipeline for NIFTY(PE/CE) & BANKNIFTY(PE/CE)
    generatePipeline(conn, wss, product.NIFTY);
    generatePipeline(conn, wss, product.BANKNIFTY);

    // SubscribeSnapshot(conn, instrumentId1, false);
    // SubscribeSnapshot(conn, instrumentId2, false);

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
    }, 500);
    // // loop calls
    socketInterval.minuteInterval = setInterval(() => {
      fromTime = fromTime + 60;
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
      }, 500);
    }, 8000); //
  },

  tickReqController: (conn, wss) => {
    // generate future instrument identifier for NIFTY & BANKNIFTY
    const instrumentId1 = "NIFTY 50";
    const instrumentId2 = "NIFTY BANK";
    const month = moment().month();
    const date = moment().date();
    const year = moment().year();
    let fromTime = moment([year, month, 08, 9, 15, 00, 00]).unix();
    // create 2 tick pipeline for NIFTY(PE/CE) & BANKN IFTY(PE/CE)
    generateTickPipeline(conn, wss, product.NIFTY);
    generateTickPipeline(conn, wss, product.BANKNIFTY);

    setInterval(() => {
      // if new NIFTY snapshot has come
      if (
        socketFlag.isNewNiftySnapshot === true &&
        socketTickFlag.isNewTickNiftySnapshot === true &&
        !socketFlag.isSyncing
      ) {
        let tempInterval;
        try {
          // loop calls
          const tickItems = [...dataTickListNifty];
          const currentTime = tickItems.pop();
          const timeStamp = currentTime.LastTradeTime;
          fromTime = timeStamp + 30;
          tempInterval = setInterval(() => {
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
            clearInterval(tempInterval);
          }, 4000); // loop each 30 sec
        } catch (err) {
          console.log(err);
        }
      }
    }, 100); // ticker interval to check if minute data has come;
  },
};

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
const {
  dataTickListNifty,
  dataTickListBankNifty,
} = require("../../helpers/queue/dataTickQueue");

module.exports = {
  minuteReqController: (conn, wss) => {
    // const instrumentId1 = generateInstrumentId(product.NIFTY);
    const instrumentId1 = "NIFTY 50";
    // const instrumentId2 = generateInstrumentId(product.BANKNIFTY);
    const instrumentId2 = "NIFTY BANK";
    const month = moment().month();
    const date = moment().date();
    const year = moment().year();
    let fromTime = moment([year, month, 20, 9, 15, 00, 00]).unix();

    // create 2 pipeline for NIFTY(PE/CE) & BANKNIFTY(PE/CE)
    generatePipeline(conn, wss, product.NIFTY);
    generatePipeline(conn, wss, product.BANKNIFTY);

    SubscribeSnapshot(conn, instrumentId1, false);
    SubscribeSnapshot(conn, instrumentId2, false);

    // console.log("Minute Call, ", moment(fromTime).toDate());
    // setTimeout(() => {
    //   GetFutureHistory(
    //     conn,
    //     instrumentId1,
    //     fromTime,
    //     fromTime,
    //     "FutureHistory"
    //   );
    //   GetFutureHistory(
    //     conn,
    //     instrumentId2,
    //     fromTime,
    //     fromTime,
    //     "FutureHistory"
    //   );

    //   socketInterval.minuteInterval = setInterval(() => {
    //     fromTime = fromTime + 60;
    //     console.log("Minute Call, ", moment(fromTime).toDate());
    //     GetFutureHistory(
    //       conn,
    //       instrumentId1,
    //       fromTime,
    //       fromTime,
    //       "FutureHistory"
    //     );
    //     GetFutureHistory(
    //       conn,
    //       instrumentId2,
    //       fromTime,
    //       fromTime,
    //       "FutureHistory"
    //     );
    //   }, 5000); // wait for 60 sec
    // }, 2000); // wait until pipeline generated
  },

  tickReqController: (conn, wss) => {
    // generate future instrument identifier for NIFTY & BANKNIFTY
    const instrumentId1 = "NIFTY 50";
    const instrumentId2 = "NIFTY BANK";
    // const month = moment().month();
    // const date = moment().date();
    // const year = moment().year();
    // let fromTime = moment([year, month, date, 9, 15, 00, 00]).unix();
    // create 2 tick pipeline for NIFTY(PE/CE) & BANKN IFTY(PE/CE)
    generateTickPipeline(conn, wss, product.NIFTY);
    generateTickPipeline(conn, wss, product.BANKNIFTY);

    socketInterval.tickInterval = setInterval(() => {
      if (
        socketFlag.isNewNiftySnapshot &&
        socketTickFlag.isNewTickNiftySnapshot &&
        socketFlag.isNewBankNiftySnapshot &&
        socketTickFlag.isNewTickBankNiftySnapshot &&
        !socketTickFlag.tickTimerDone
      ) {
        let tempInterval;
        socketTickFlag.tickTimerDone = true;
        socketTickFlag.tickCheckNifty = true;
        socketTickFlag.tickCheckBank = true;
        try {
          // loop calls
          const tickItems = [...dataTickListNifty];
          const bankItems = [...dataTickListBankNifty];
          const currentTime = tickItems.pop();
          const currentTimeB = bankItems.pop();
          const timeStamp = currentTime.LastTradeTime;
          const timeStampB = currentTimeB.LastTradeTime;
          console.log("Tick/Minute Call!");
          tempInterval = setInterval(() => {
            const fromTime = timeStamp + 30;
            const fromTimeB = timeStampB + 30;
            console.log("Tick Call, ", moment(fromTime).toDate());
            socketTickFlag.tickCheckNifty = true;
            socketTickFlag.tickCheckBank = true;
            GetFutureTickHistory(
              conn,
              instrumentId1,
              fromTime,
              fromTime,
              "FutureHistory"
            );
            GetFutureTickHistory(
              conn,
              instrumentId2,
              fromTimeB,
              fromTimeB,
              "FutureHistory"
            );
            clearInterval(tempInterval);
          }, 30000); // loop each 30 sec
        } catch (err) {
          console.log(err);
        }
      }
    }, 100);
  },
};

const moment = require("moment");
const {
  GetFutureHistory,
  GetFutureTickHistory,
  SubscribeSnapshot,
} = require("../../listeners/socketManager");
const { socketFlag, socketInterval } = require("../../constants/socketFlag");
const {
  dataListNifty,
  dataListBankNifty,
  optionReqListNifty,
  optionReqListBankNifty,
  optionVolListNifty,
  optionVolListBankNifty,
  finalListNifty,
  finalListBankNifty,
} = require("../../helpers/queue/dataQueue");
const {
  dataTickListNifty,
  dataTickListBankNifty,
  optionTickReqListNifty,
  optionTickReqListBankNifty,
  optionTickVolListNifty,
  optionTickVolListBankNifty,
  finalTickListNifty,
  finalTicklListBankNifty,
} = require("../../helpers/queue/dataTickQueue");
const { fetchLatestVolumeData } = require("../database/sumVolController");
const product = require("../../constants/product");
const { refactorFinalData } = require("../../helpers/refactorFinalData");
const { fetchLatestExpoAvgData } = require("../database/expoAvgController");

module.exports = {
  syncControllers: async (conn) => {
    if (!socketFlag.isSyncing) {
      console.log("Data syncing initiated!");
      socketFlag.isSyncing = true;

      // min data queues
      // clear all the queues
      dataListNifty.splice(0, dataListNifty.length);
      dataListBankNifty.splice(0, dataListBankNifty.length);
      optionReqListNifty.splice(0, optionReqListNifty.length);
      optionReqListBankNifty.splice(0, optionReqListBankNifty.length);

      // tick data queues
      dataTickListNifty.splice(0, dataTickListNifty.length);
      dataTickListBankNifty.splice(0, dataTickListBankNifty.length);
      optionTickReqListNifty.splice(0, optionTickReqListNifty.length);
      optionTickReqListBankNifty.splice(0, optionTickReqListBankNifty.length);

      optionVolListNifty.splice(0, optionVolListNifty.length);
      optionVolListBankNifty.splice(0, optionVolListBankNifty.length);
      optionTickVolListNifty.splice(0, optionTickVolListNifty.length);
      optionTickVolListBankNifty.splice(0, optionTickVolListBankNifty.length);
      let elList = [15, 30, 45, 60];
      elList.forEach((dur) => {
        finalListNifty[dur].splice(0, finalListNifty[dur].length);
        finalListBankNifty[dur].splice(0, finalListBankNifty[dur].length);
        finalTickListNifty[dur].splice(0, finalTickListNifty[dur].length);
        finalTicklListBankNifty[dur].splice(
          0,
          finalTicklListBankNifty[dur].length
        );
      });

      // fetch all the data of volume and expo avg from database
      // min vol data
      const niftyData = await fetchLatestVolumeData(product.NIFTY, "60");
      console.log(niftyData)
      const niftyList = await refactorFinalData(niftyData, "vol");
      optionVolListNifty.push(...niftyList);
      const bankData = await fetchLatestVolumeData(product.BANKNIFTY, "60");
      const bankList = await refactorFinalData(bankData, "vol");
      optionVolListBankNifty.push(...bankList);

      // tick vol data
      const niftyTickData = await fetchLatestVolumeData(product.NIFTY, "30");
      const niftyTickList = await refactorFinalData(niftyTickData, "vol");
      optionTickVolListNifty.push(...niftyTickList);
      console.log(optionTickVolListNifty)
      const bankTickData = await fetchLatestVolumeData(product.BANKNIFTY, "30");
      const bankTickList = await refactorFinalData(bankTickData, "vol");
      optionTickVolListBankNifty.push(bankTickList);

      // expo data tick and min
      ["15", "30", "45", "60"].forEach(async (item) => {
        // min avg data
        const nAvgData = await fetchLatestExpoAvgData(
          product.NIFTY,
          "60",
          item
        );
        const nAvgD = await refactorFinalData(nAvgData, "expo");
        finalListNifty[item].push(...nAvgD);
        const bAvgData = await fetchLatestExpoAvgData(
          product.BANKNIFTY,
          "60",
          item
        );
        const bAvgD = await refactorFinalData(bAvgData, "expo");
        finalListNifty[item].push(...bAvgD);

        // tick avg data
        const nAvgTickData = await fetchLatestExpoAvgData(
          product.NIFTY,
          "30",
          item
        );
        const nAvgTickD = await refactorFinalData(nAvgTickData, "expo");
        finalTickListNifty[item] = nAvgTickD;
        const bAvgTickData = await fetchLatestExpoAvgData(
          product.BANKNIFTY,
          "30",
          item
        );
        const bAvgTickD = await refactorFinalData(bAvgTickData, "expo");
        finalTickListNifty[item] = bAvgTickD;
      });

      // fetch all the data from global db one by one until the current timestamp minute
      if (
        optionVolListNifty.length !== 0 ||
        optionTickVolListNifty.length !== 0
      ) {
        socketFlag.isSyncing = false;
        socketFlag.isNewNiftySnapshot = false;
        console.log("Data is up to date!")
        return;
      }
      const minLastTime = optionVolListNifty.at(-1).LastTradeTime;
      const tickLastTime = optionTickVolListNifty.at(-1).LastTradeTime;

      // unsubscribe snapshots;
      const instrumentId1 = "NIFTY 50";
      const instrumentId2 = "NIFTY BANK";

      SubscribeSnapshot(conn, instrumentId1, true);
      SubscribeSnapshot(conn, instrumentId2, true);

      syncTickData(conn, tickLastTime);
      syncMinData(conn, minLastTime);
    }
  },
};

function syncTickData(conn, time) {
  try {
    // generate future instrument identifier for NIFTY & BANKNIFTY
    // const instrumentId1 = generateInstrumentId(product.NIFTY);
    const instrumentId1 = "NIFTY 50";
    const instrumentId2 = "NIFTY BANK";

    // const instrumentId2 = generateInstrumentId(product.BANKNIFTY);
    let fromTime = time;

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
      fromTime,
      fromTime,
      "FutureHistory"
    );
    // loop calls
    let tempInterval = setInterval(() => {
      fromTime = fromTime + 30;
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
        fromTime,
        fromTime,
        "FutureHistory"
      );
      const second = moment().second();
      const minute = moment().minute();
      const hour = moment().hour();
      const date = moment().date();
      const month = moment().month();
      const year = moment().year();
      let endTime = moment([
        year,
        month,
        date,
        hour,
        minute,
        second,
        00,
      ]).unix();
      if (endTime - 30 < fromTime) {
        clearInterval(tempInterval);

        SubscribeSnapshot(conn, instrumentId1, false);
        SubscribeSnapshot(conn, instrumentId2, false);

        socketFlag.isSyncing = false;
        console.log("Tick data syncing is done!");
      }
    }, 3000); // loop each 3 sec
  } catch (err) {
    console.log(err);
  }
}

function syncMinData(conn, time) {
  try {
    // generate future instrument identifier for NIFTY & BANKNIFTY
    // const instrumentId1 = generateInstrumentId(product.NIFTY);
    const instrumentId1 = "NIFTY 50";
    // const instrumentId2 = generateInstrumentId(product.BANKNIFTY);
    const instrumentId2 = "NIFTY BANK";
    let fromTime = time;

    GetFutureHistory(conn, instrumentId1, fromTime, fromTime, "FutureHistory");
    GetFutureHistory(conn, instrumentId2, fromTime, fromTime, "FutureHistory");
    // loop calls
    let tempInterval = setInterval(() => {
      fromTime = fromTime + 60;
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
      const minute = moment().minute();
      const hour = moment().hour();
      const date = moment().date();
      const month = moment().month();
      const year = moment().year();
      let endTime = moment([year, month, date, hour, minute, 0, 0]).unix();
      if (endTime - 60 < fromTime) {
        clearInterval(tempInterval);

        SubscribeSnapshot(conn, instrumentId1, false);
        SubscribeSnapshot(conn, instrumentId2, false);
        console.log("Minute data syncing is done!");
      }
    }, 4000); // loop each 3 sec
  } catch (err) {
    console.log(err);
  }
}

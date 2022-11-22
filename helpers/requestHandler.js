const schedule = require("node-schedule");
const moment = require("moment");

const messageTypes = require("../constants/messageTypes");
const { fetchInstrumentId } = require("../controllers/instrumentController");
const {
  GetOptionHistory,
  GetFutureHistory,
} = require("../listeners/socketManager");
const types = require("../constants/types");
const { formatFinalData } = require("../controllers/dataController");
const dataQueue = require("./queue/dataQueue");

let counter = 0;
let fetchedOptions = []
let plotData = []
let tempVolumeSum = 0;

module.exports = {
  requestHandler: (conn, ws, data, options) => {
    const { Request, Result, MessageType } = data;
    if (MessageType == messageTypes.InstrumentsResult) {
      // const instrumentId = fetchInstrumentId(Result);
      const instrumentId = "FUTIDX_NIFTY_24NOV2022_XX_0";
      const month = moment().month();
      const date = moment().date();
      const year = moment().year();
      const fromTime = moment([year, month, 11, 9, 15, 00, 00]).unix();
      const toTime = moment([year, month, 11, 15, 30, 00, 00]).unix();

      // handleFunctionCalls(connection, "GET_HISTORY")
      GetFutureHistory(conn, instrumentId, fromTime, toTime);
      //   GetHistory(conn, "NIFTY27OCT2217600CE");
    }
    // History of Future Symbol
    else if (
      MessageType === messageTypes.HistoryOHLCResult &&
      Request.IsShortIdentifier === false
    ) {
      const historyList = Result;
      let optionSymbolList = [];
      historyList.forEach((historyItem) => {
        // option symbol for NIFTY CE
        const optionSymbols = generateOptionSymbolList(historyItem);
        optionSymbolList.push(optionSymbols);
      });
      options = optionSymbolList.reverse();
      fetchedOptions = [...options]

      const rule = new schedule.RecurrenceRule();
      rule.second = [0, new schedule.Range(0, 1000, 2)];

      schedule.scheduleJob("Option", rule, () => {
        console.log("Option Length", options.length)
        let currentJob = schedule.scheduledJobs["Option"];
        if (options.length === 0) {
          console.log("Done");
          return currentJob.cancel();
        }

        const currentItem = options[0];
        let currentOptions = currentItem.OptionSymbols;

        currentOptions.forEach((sym) => {
          GetOptionHistory(conn, sym);
        });

        // const optionData = {
        //   MessageType: "GetOptionSymbols",
        //   Request: {
        //     OptionType: "CE",
        //     Product: "NIFTY",
        //   },
        //   Result: currentItem,
        // };
        // const parsedOptionData = JSON.stringify(optionData);

        // ws.send(parsedOptionData);

        options.shift();
      });
    }
    // history of option symbols
    else if (
      MessageType === messageTypes.HistoryOHLCResult &&
      Request.IsShortIdentifier === true
    ) {
      const currentIndex = Math.floor(counter/4);
      const currentOption = fetchedOptions[currentIndex];
      const tradeTime = currentOption.LastTradeTime;
      const optionData = Result;
      const filteredData = optionData.filter(item => item.LastTradeTime === tradeTime);
      const tradeVolume = filteredData[0].TradedQty
      counter = counter+1;
      if(counter % 4 === 0) {
        // counter divisible of 4 means reset the sum value
        tempVolumeSum = tempVolumeSum + tradeVolume
        plotData.push({
          tradeTime: tradeTime,
          volume: tempVolumeSum
        })
        tempVolumeSum = 0
        console.log("Plot Lenght", plotData.length)
        // ws.send(JSON.stringify(plotData));
      }else {
        tempVolumeSum = tempVolumeSum + tradeVolume
      }
      if(plotData.length > 355) {
        const data = formatFinalData(plotData)
        console.log(data)
        // ws.send(JSON.stringify({
        //   MessageType: "FinalData",
        //   Result: data
        // }))
      }
    }
  },
};

function roundnum(num) {
  return Math.round(num / 50) * 50;
}

function generateOptionSymbolList(historyItem) {
  const strikePrice = historyItem.Close;
  const first = roundnum(strikePrice);
  let roundList = [first];
  let optionList = [];
  let valueList = [50, 100, 150];
  valueList.forEach((item) => {
    const roundItem = first - item;
    roundList.push(roundItem);
  });

  // generate option symbols
  roundList.forEach((round) => {
    //Todo make it dynamic when generating symbol

    const optionSymbol = `NIFTY03NOV22${round}CE`;
    optionList.push(optionSymbol);
  });

  const item = {
    ...historyItem,
    OptionSymbols: optionList,
  };

  return item;
}

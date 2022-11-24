const product = require("../../constants/product");
const { socketFlag, socketTickFlag, socketInterval } = require("../../constants/socketFlag");
const {
  generateOptionSymbolsNifty,
  generateOptionSymbolsBankNifty,
} = require("../../helpers/options/optionSymbolHandler");
const {
  generateSumOfVolOptionListNifty,
  generateSumOfVolOptionListBankNifty,
  generateSumOfTickVolOptionListNifty,
  generateSumOfTickVolOptionListBankNifty,
} = require("../../helpers/options/optionVolListHandler");
const dataQueue = require("../../helpers/queue/dataQueue");
const {
  dataListNifty,
  dataListBankNifty,
} = require("../../helpers/queue/dataQueue");
const {
  dataTickListNifty,
  dataTickListBankNifty,
} = require("../../helpers/queue/dataTickQueue");
const {
  optionRequestNifty,
  optionRequestBankNifty,
  optionTickRequestNifty,
  optionTickRequestBankNifty,
} = require("../request/optionReqController");

module.exports = {
  generatePipeline: (conn, wss, _product) => {
    switch (_product) {
      case product.NIFTY:
        //*: stop the interval when the market is closed
        socketInterval.niftyPipeInterval = setInterval(async () => {
          // new data has arrived and queue of NIFTY is not empty
          if (socketFlag.isNewNiftySnapshot && dataListNifty.length !== 0) {
            socketFlag.isNewNiftySnapshot = false;
            // no need to wait for that function (instant execution)
            const data = generateOptionSymbolsNifty(false);
            const { tradeTime } = data;
            // async function (takes time to get the 4 data points from global data feed)
            socketFlag.isOptionNiftyFetched = false;
            optionRequestNifty(conn, data);

            socketFlag.isOptionSumNiftyDone = false;
            generateSumOfVolOptionListNifty(tradeTime, wss);
          }
        }, 300);
        break;
      case product.BANKNIFTY:
        // do something for banknifty
        socketInterval.bankNiftyPipeInterval = setInterval(() => {
          if (
            socketFlag.isNewBankNiftySnapshot &&
            dataListBankNifty.length !== 0
          ) {
            socketFlag.isNewBankNiftySnapshot = false;
            // no need to wait for that function (instant execution)
            const data = generateOptionSymbolsBankNifty(false);
            const { tradeTime } = data;

            // async function (takes time to get the 4 data points from global data feed)
            socketFlag.isOptionBankNiftyFetched = false;
            optionRequestBankNifty(conn, data);

            socketFlag.isOptionSumBankNiftyDone = false;
            generateSumOfVolOptionListBankNifty(tradeTime, wss);
          }
        }, 300);
        break;
    }
  },
  generateTickPipeline: (conn, wss, _product) => {
    switch (_product) {
      case product.NIFTY:
        //Todo: stop the interval when the market is closed
        socketInterval.niftyTickPipeInterval = setInterval(async () => {
          // new data has arrived and queue of NIFTY is not empty
          if (
            socketTickFlag.isNewTickNiftySnapshot &&
            dataTickListNifty.length !== 0
          ) {
            socketTickFlag.isNewTickNiftySnapshot = false;
            // no need to wait for that function (instant execution)
            // true is option is of 30 sec tick interval
            const data = generateOptionSymbolsNifty(true);
            const { tradeTime } = data;
            // async function (takes time to get the 4 data points from global data feed)
            socketTickFlag.isOptionTickNiftyFetched = false;
            optionTickRequestNifty(conn, data);

            socketTickFlag.isOptionTickSumNiftyDone = false;
            generateSumOfTickVolOptionListNifty(tradeTime, wss);
          }
        }, 300);
        break;
      case product.BANKNIFTY:
        // do something for banknifty
        socketInterval.bankNiftyTickPipeInterval = setInterval(() => {
          if (
            socketTickFlag.isNewTickBankNiftySnapshot &&
            dataTickListBankNifty.length !== 0
          ) {
            socketTickFlag.isNewTickBankNiftySnapshot = false;
            // no need to wait for that function (instant execution)
            // true is option is of 30 sec tick interval
            const data = generateOptionSymbolsBankNifty(true);
            const { tradeTime } = data;

            // async function (takes time to get the 4 data points from global data feed)
            socketTickFlag.isOptionTickBankNiftyFetched = false;
            optionTickRequestBankNifty(conn, data);

            socketTickFlag.isOptionTickSumBankNiftyDone = false;
            generateSumOfTickVolOptionListBankNifty(tradeTime, wss);
          }
        }, 300);
        break;
    }
  },
};

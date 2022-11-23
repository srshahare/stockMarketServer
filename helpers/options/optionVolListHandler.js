const moment = require("moment");
const option = require("../../constants/option");
const product = require("../../constants/product");
const { socketFlag, socketTickFlag, socketInterval } = require("../../constants/socketFlag");
const {
  generateExpoDataNifty,
  generateExpoTickDataNifty,
  generateExpoDataBankNifty,
  generateExpoTickDataBankNifty,
} = require("../../controllers/data/expoDataController");
const {
  saveSumVolumeData,
} = require("../../controllers/database/sumVolController");
const {
  optionVolListNifty,
  optionVolListBankNifty,
  optionReqListNifty,
  optionReqListBankNifty,
} = require("../queue/dataQueue");
const {
  optionTickReqListNifty,
  optionTickVolListNifty,
  optionTickReqListBankNifty,
  optionTickVolListBankNifty,
} = require("../queue/dataTickQueue");
const { sendWSMessage } = require("../sendMessage");

module.exports = {
  generateSumOfVolOptionListNifty: (tradeTime, wss) => {
    const niftyList = optionReqListNifty;
    let niftyInterval;

    // set interval for nifty
    niftyInterval = setInterval(() => {
      if (
        socketFlag.isOptionSumNiftyDone === false &&
        optionReqListNifty.length >= 8
      ) {
        let sumVolCall = 0;
        let sumVolPut = 0;
        // get the option items for current trade Time
        const filteredList = niftyList.filter(
          (item) => item.LastTradeTime === tradeTime
        );
        const niftyOptionList = filteredList.filter(
          (item) => item.Product === product.NIFTY
        );
        const callList = niftyOptionList.filter(
          (item) => item.OptionType === option.CALL
        );
        const putList = niftyOptionList.filter(
          (item) => item.OptionType === option.PUT
        );

        // sum volume and create a new object and push in volume list
        callList.forEach((item) => {
          const vol = item.TradedQty;
          sumVolCall = sumVolCall + vol;
        });
        putList.forEach((item) => {
          const vol = item.TradedQty;
          sumVolPut = sumVolPut + vol;
        });

        const {percentCE, percentPE} = calculatePercentWeight(sumVolCall, sumVolPut)

        const listItem = {
          exchange: product.NIFTY,
          interval: "60",
          dataType: "SumVolume",
          [option.CALL]: {
            Volume: parseFloat(sumVolCall),
            PercentVolume: parseFloat(percentCE)
          },
          [option.PUT]: {
            Volume: parseFloat(sumVolPut),
            PercentVolume: parseFloat(percentPE)
          },
          tradeTime,
          date: moment.unix(tradeTime).format("DD/MM/YYYY hh:mm:ss"),
        };
        optionVolListNifty.push(listItem);
        sendWSMessage(wss, listItem)

        // save sum of volume to database
        saveSumVolumeData(listItem, "60", product.NIFTY);

        // delete all the option items of current tradeTime
        filteredList.forEach((item) => {
          const index = optionReqListNifty.indexOf(item);
          if (index > -1) {
            optionReqListNifty.splice(index, 1);
          }
        });
        socketFlag.isOptionSumNiftyDone = true;

        //Todo generate exponential data for duration 15, 30, 45, 60
        generateExpoDataNifty(tradeTime, "15", wss);
        generateExpoDataNifty(tradeTime, "30", wss);
        generateExpoDataNifty(tradeTime, "45", wss);
        generateExpoDataNifty(tradeTime, "60", wss);

        clearInterval(niftyInterval);
      }
    }, 300);
  },

  generateSumOfVolOptionListBankNifty: (tradeTime, wss) => {
    const bankNiftyList = optionReqListBankNifty;
    let bankNiftyInterval;
    // set interval for bank nifty
    bankNiftyInterval = setInterval(() => {
      if (
        socketFlag.isOptionSumBankNiftyDone === false &&
        optionReqListBankNifty.length >= 8
      ) {
        let sumVolCall = 0;
        let sumVolPut = 0;
        const filteredList = bankNiftyList.filter(
          (item) => item.LastTradeTime === tradeTime
        );
        const bankNiftyOptionList = filteredList.filter(
          (item) => item.Product === product.BANKNIFTY
        );
        const callList = bankNiftyOptionList.filter(
          (item) => item.OptionType === option.CALL
        );
        const putList = bankNiftyOptionList.filter(
          (item) => item.OptionType === option.PUT
        );

        // sum volume and create a new object and push in volume list
        callList.forEach((item) => {
          const vol = item.TradedQty;
          sumVolCall = sumVolCall + vol;
        });
        putList.forEach((item) => {
          const vol = item.TradedQty;
          sumVolPut = sumVolPut + vol;
        });

        const {percentCE, percentPE} = calculatePercentWeight(sumVolCall, sumVolPut)

        const listItem = {
          exchange: product.BANKNIFTY,
          interval: "60",
          dataType: "SumVolume",
          [option.CALL]: {
            Volume: parseFloat(sumVolCall),
            PercentVolume: parseFloat(percentCE)
          },
          [option.PUT]: {
            Volume: parseFloat(sumVolPut),
            PercentVolume: parseFloat(percentPE)
          },
          tradeTime,
          date: moment.unix(tradeTime).format("DD/MM/YYYY hh:mm:ss"),
        };
        optionVolListBankNifty.push(listItem);
        sendWSMessage(wss, listItem)

        // save sum of volume to database
        saveSumVolumeData(listItem, "60", product.BANKNIFTY);

        // delete all the option items of current tradeTime
        filteredList.forEach((item) => {
          const index = optionReqListBankNifty.indexOf(item);
          if (index > -1) {
            optionReqListBankNifty.splice(index, 1);
          }
        });

        socketFlag.isOptionSumBankNiftyDone = true;

        //Todo generate exponential data for duration 15, 30, 45, 60
        generateExpoDataBankNifty(tradeTime, "15", wss);
        generateExpoDataBankNifty(tradeTime, "30", wss);
        generateExpoDataBankNifty(tradeTime, "45", wss);
        generateExpoDataBankNifty(tradeTime, "60", wss);

        clearInterval(bankNiftyInterval);
      }
    }, 300);
  },

  generateSumOfTickVolOptionListNifty: (tradeTime, wss) => {
    const niftyList = optionTickReqListNifty;
    let niftyInterval;

    // set interval for nifty
    niftyInterval = setInterval(() => {
      if (
        socketTickFlag.isOptionTickSumNiftyDone === false &&
        optionTickReqListNifty.length >= 8
      ) {
        let sumVolCall = 0;
        let sumVolPut = 0;
        // get the option items for current trade Time
        const filteredList = niftyList.filter(
          (item) => item.LastTradeTime === tradeTime
        );
        const niftyOptionList = filteredList.filter(
          (item) => item.Product === product.NIFTY
        );
        const callList = niftyOptionList.filter(
          (item) => item.OptionType === option.CALL
        );
        const putList = niftyOptionList.filter(
          (item) => item.OptionType === option.PUT
        );

        // sum volume and create a new object and push in volume list
        callList.forEach((item) => {
          const vol = item.TradedQty;
          sumVolCall = sumVolCall + vol;
        });
        putList.forEach((item) => {
          const vol = item.TradedQty;
          sumVolPut = sumVolPut + vol;
        });

        const {percentCE, percentPE} = calculatePercentWeight(sumVolCall, sumVolPut)

        const listItem = {
          exchange: product.NIFTY,
          interval: "30",
          dataType: "SumVolume",
          [option.CALL]: {
            Volume: parseFloat(sumVolCall),
            PercentVolume: parseFloat(percentCE)
          },
          [option.PUT]: {
            Volume: parseFloat(sumVolPut),
            PercentVolume: parseFloat(percentPE)
          },
          tradeTime,
          date: moment.unix(tradeTime).format("DD/MM/YYYY hh:mm:ss"),
        };
        optionTickVolListNifty.push(listItem);
        
        // save sum of volume to database
        saveSumVolumeData(listItem, "30", product.NIFTY);
        
        sendWSMessage(wss, listItem)

        // delete all the option items of current tradeTime
        filteredList.forEach((item) => {
          const index = optionTickReqListNifty.indexOf(item);
          if (index > -1) {
            optionTickReqListNifty.splice(index, 1);
          }
        });
        socketTickFlag.isOptionTickSumNiftyDone = true;

        // generate exponential data for duration 15, 30, 45, 60
        generateExpoTickDataNifty(tradeTime, "15", wss);
        generateExpoTickDataNifty(tradeTime, "30", wss);
        generateExpoTickDataNifty(tradeTime, "45", wss);
        generateExpoTickDataNifty(tradeTime, "60", wss);

        clearInterval(niftyInterval);
      }
    }, 300);
  },

  generateSumOfTickVolOptionListBankNifty: (tradeTime, wss) => {
    const bankNiftyList = optionTickReqListBankNifty;
    let bankNiftyInterval;
    // set interval for bank nifty
    bankNiftyInterval = setInterval(() => {
      if (
        socketTickFlag.isOptionTickSumBankNiftyDone === false &&
        optionTickReqListBankNifty.length >= 8
      ) {
        let sumVolCall = 0;
        let sumVolPut = 0;
        const filteredList = bankNiftyList.filter(
          (item) => item.LastTradeTime === tradeTime
          );
        const bankNiftyOptionList = filteredList.filter(
          (item) => item.Product === product.BANKNIFTY
        );
        const callList = bankNiftyOptionList.filter(
          (item) => item.OptionType === option.CALL
        );
        const putList = bankNiftyOptionList.filter(
          (item) => item.OptionType === option.PUT
        );

        // sum volume and create a new object and push in volume list
        callList.forEach((item) => {
          const vol = item.TradedQty;
          sumVolCall = sumVolCall + vol;
        });
        putList.forEach((item) => {
          const vol = item.TradedQty;
          sumVolPut = sumVolPut + vol;
        });

        const {percentCE, percentPE} = calculatePercentWeight(sumVolCall, sumVolPut)

        const listItem = {
          exchange: product.BANKNIFTY,
          interval: "30",
          dataType: "SumVolume",
          [option.CALL]: {
            Volume: parseFloat(sumVolCall),
            PercentVolume: parseFloat(percentCE)
          },
          [option.PUT]: {
            Volume: parseFloat(sumVolPut),
            PercentVolume: parseFloat(percentPE)
          },
          tradeTime,
          date: moment.unix(tradeTime).format("DD/MM/YYYY hh:mm:ss"),
        };
        optionTickVolListBankNifty.push(listItem);
        sendWSMessage(wss, listItem)

        // generate exponential data for duration 15, 30, 45, 60
        generateExpoTickDataBankNifty(tradeTime, "15", wss);
        generateExpoTickDataBankNifty(tradeTime, "30", wss);
        generateExpoTickDataBankNifty(tradeTime, "45", wss);
        generateExpoTickDataBankNifty(tradeTime, "60", wss);

        // save sum of volume to database
        saveSumVolumeData(listItem, "30", product.BANKNIFTY);

        // delete all the option items of current tradeTime
        filteredList.forEach((item) => {
          const index = optionTickReqListBankNifty.indexOf(item);
          if (index > -1) {
            optionTickReqListBankNifty.splice(index, 1);
          }
        });

        socketFlag.isOptionTickSumBankNiftyDone = true;
        clearInterval(bankNiftyInterval);
      }
    }, 300);
  },
  
};

function calculatePercentWeight(sumVolCall, sumVolPut) {
  const sumCE = parseFloat(sumVolCall);
  const sumPE = parseFloat(sumVolPut);
  const total = parseFloat(parseFloat(sumCE) + parseFloat(sumPE))
  const avgCE = parseFloat(parseFloat(sumCE)/parseFloat(total))
  const avgPE = parseFloat(parseFloat(sumPE)/parseFloat(total))
  const percentCE = parseFloat(avgCE * sumCE).toFixed(2)
  const percentPE = parseFloat(avgPE * sumPE).toFixed(2)
  const listItem = {
    percentCE: isNaN(percentCE) ? 0 : parseFloat(percentCE),
    percentPE: isNaN(percentPE) ? 0: parseFloat(percentPE)
  }
  return listItem;
}

const moment = require("moment");
const chart = require("../../constants/chart");
const option = require("../../constants/option");
const product = require("../../constants/product");
const { socketFlag, socketTickFlag } = require("../../constants/socketFlag");
const {
  optionVolListNifty,
  finalListNifty,
  optionVolListBankNifty,
  finalListBankNifty,
} = require("../../helpers/queue/dataQueue");
const {
  optionTickVolListNifty,
  finalTickListNifty,
  optionTickVolListBankNifty,
  finalTicklListBankNifty,
} = require("../../helpers/queue/dataTickQueue");
const { sendWSMessage } = require("../../helpers/sendMessage");
const { saveExpoAvgData } = require("../database/expoAvgController");

module.exports = {
  generateExpoDataNifty: (tradeTime, duration, wss) => {
    // generate expo data for duration(15, 30, 45, 60)
    let intervalDuration = parseInt(duration); // in min
    if (optionVolListNifty.length == intervalDuration) {
      const listItem = generateFirstExpoAvg(
        optionVolListNifty,
        intervalDuration,
        tradeTime
      );
      pushExpoItem(listItem, intervalDuration, product.NIFTY);
      socketFlag.isExpoFinalDataNifty = true
      // save expo avg data to db
      saveExpoAvgData(
        listItem,
        "60",
        intervalDuration,
        product.NIFTY,
        chart.STANDARD
      );
      sendWSMessage(wss, listItem)
    } else if (optionVolListNifty.length > intervalDuration) {
      const tempVolListNifty = [...optionVolListNifty];
      const tempFinalListNifty = generateTempFinalList(
        intervalDuration,
        product.NIFTY
      );
      const currentItem = tempVolListNifty.pop();
      const previousItem = tempFinalListNifty.pop();
      const listItem = generateExpoAvg(
        currentItem,
        previousItem,
        tradeTime,
        intervalDuration
      );
      pushExpoItem(listItem, intervalDuration, product.NIFTY);
      socketFlag.isExpoFinalDataNifty = true
      // save expo avg data to db
      saveExpoAvgData(
        listItem,
        "60",
        intervalDuration,
        product.NIFTY,
        chart.STANDARD
      );
      sendWSMessage(wss, listItem)
    }
  },
  generateExpoDataBankNifty: (tradeTime, duration, wss) => {
    // generate expo data for duration(15, 30, 45, 60)
    let intervalDuration = parseInt(duration); // in min
    if (optionVolListBankNifty.length == intervalDuration) {
      const listItem = generateFirstExpoAvg(
        optionVolListBankNifty,
        intervalDuration,
        tradeTime
      );
      pushExpoItem(listItem, intervalDuration, product.BANKNIFTY);
      socketFlag.isExpoFinalDataBankNifty = true
      // save expo avg data to db
      saveExpoAvgData(
        listItem,
        "60",
        intervalDuration,
        product.BANKNIFTY,
        chart.STANDARD
      );
      sendWSMessage(wss, listItem)
    } else if (optionVolListBankNifty.length > intervalDuration) {
      const tempVolListBankNifty = [...optionVolListBankNifty];
      const tempFinalListBankNifty = generateTempFinalList(
        intervalDuration,
        product.BANKNIFTY
      );
      const currentItem = tempVolListBankNifty.pop();
      const previousItem = tempFinalListBankNifty.pop();
      const listItem = generateExpoAvg(
        currentItem,
        previousItem,
        tradeTime,
        intervalDuration
      );
      pushExpoItem(listItem, intervalDuration, product.BANKNIFTY);
      socketFlag.isExpoFinalDataBankNifty = true
      // save expo avg data to db
      saveExpoAvgData(
        listItem,
        "60",
        intervalDuration,
        product.BANKNIFTY,
        chart.STANDARD
      );
      sendWSMessage(wss, listItem)
    }
  },
  generateExpoTickDataNifty: (tradeTime, duration, wss) => {
    // generate expo data for duration(15, 30, 45, 60)
    let intervalDuration = parseInt(duration); // in min
    if (optionTickVolListNifty.length == intervalDuration) {
      const listItem = generateFirstExpoAvg(
        optionTickVolListNifty,
        intervalDuration,
        tradeTime
      );
      pushTickExpoItem(listItem, intervalDuration, product.NIFTY);
      socketTickFlag.isExpoTickFinalData = true
      // save expo avg data to db
      saveExpoAvgData(
        listItem,
        "30",
        parseInt(intervalDuration),
        product.NIFTY,
        chart.STANDARD
      );
      sendWSMessage(wss, listItem)
    } else if (optionTickVolListNifty.length > intervalDuration) {
      const tempVolListNifty = [...optionTickVolListNifty];
      const tempFinalListNifty = generateTempTickFinalList(
        intervalDuration,
        product.NIFTY
      );
      const currentItem = tempVolListNifty.pop();
      const previousItem = tempFinalListNifty.pop();
      const listItem = generateExpoAvg(
        currentItem,
        previousItem,
        tradeTime,
        intervalDuration
      );
      pushTickExpoItem(listItem, intervalDuration, product.NIFTY);
      socketTickFlag.isExpoTickFinalData = true
      // save expo avg data to db
      saveExpoAvgData(
        listItem,
        "30",
        parseInt(intervalDuration),
        product.NIFTY,
        chart.STANDARD
      );
      sendWSMessage(wss, listItem)
    }
  },
  generateExpoTickDataBankNifty: (tradeTime, duration, wss) => {
    // generate expo data for duration(15, 30, 45, 60)
    let intervalDuration = parseInt(duration); // in min
    if (optionTickVolListBankNifty.length == intervalDuration) {
      const listItem = generateFirstExpoAvg(
        optionTickVolListBankNifty,
        intervalDuration,
        tradeTime
      );
      pushTickExpoItem(listItem, intervalDuration, product.BANKNIFTY);
      socketTickFlag.isExpoTickFinalDataBankNifty = true
      // save expo avg data to db
      saveExpoAvgData(
        listItem,
        "30",
        parseInt(intervalDuration),
        product.BANKNIFTY,
        chart.STANDARD
      );
      sendWSMessage(wss, listItem)
    } else if (optionTickVolListBankNifty.length > intervalDuration) {
      const tempVolListBankNifty = [...optionTickVolListBankNifty];
      const tempFinalListBankNifty = generateTempTickFinalList(
        intervalDuration,
        product.BANKNIFTY
      );
      const currentItem = tempVolListBankNifty.pop();
      const previousItem = tempFinalListBankNifty.pop();
      const listItem = generateExpoAvg(
        currentItem,
        previousItem,
        tradeTime,
        intervalDuration
      );
      pushTickExpoItem(listItem, intervalDuration, product.BANKNIFTY);
      socketTickFlag.isExpoTickFinalDataBankNifty = true
      // save expo avg data to db
      saveExpoAvgData(
        listItem,
        "30",
        parseInt(intervalDuration),
        product.BANKNIFTY,
        chart.STANDARD
      );
      sendWSMessage(wss, listItem)
    }
  },
};

function pushExpoItem(listItem, duration, exchange) {
  if (!listItem) {
    return;
  }
  switch (exchange) {
    case product.NIFTY:
      finalListNifty[duration].push(listItem);
      break;
    case product.BANKNIFTY:
      finalListBankNifty[duration].push(listItem);
      break;
    default:
      return;
  }
}
function pushTickExpoItem(listItem, duration, exchange) {
  if(!listItem) {
    return
  }
  switch (exchange) {
    case product.NIFTY:
      finalTickListNifty[duration].push(listItem);
      break;
    case product.BANKNIFTY:
      finalTicklListBankNifty[duration].push(listItem);
      break;
    default:
      return;
  }
}

function generateTempFinalList(duration, exchange) {
  let tempFinalList = [];
  switch (exchange) {
    case product.NIFTY:
      tempFinalList = [...finalListNifty[duration]];
      break;
    case product.BANKNIFTY:
      tempFinalList = [...finalListBankNifty[duration]];
      break;
    default:
      return;
  }
  return tempFinalList;
}

function generateTempTickFinalList(duration, exchange) {
  let tempFinalList = [];
  switch (exchange) {
    case product.NIFTY:
      tempFinalList = [...finalTickListNifty[duration]];
      break;
    case product.BANKNIFTY:
      tempFinalList = [...finalTicklListBankNifty[duration]];
      break;
    default:
      return;
  }
  return tempFinalList;
}

function generateFirstExpoAvg(volumeList, duration, tradeTime) {
  const firstElementColl = volumeList.slice(0, duration);
  let sumCE = 0;
  let sumPE = 0;
  let percentSumCE = 0;
  let percentSumPE = 0;
  firstElementColl.forEach((item) => {
    const { CE, PE } = item;
    sumCE += CE.Volume;
    sumPE += PE.Volume;
    percentSumCE += parseFloat(CE.PercentVolume);
    percentSumPE += parseFloat(PE.PercentVolume);
  });
  let SMAvgCE = sumCE / duration;
  let SMAvgPE = sumPE / duration;
  let SMPercentAvgCE = parseFloat(percentSumCE / duration);
  let SMPercentAvgPE = parseFloat(percentSumPE / duration);

  let listItem = {
    [option.PUT]: {
      Volume: parseFloat(SMAvgPE).toFixed(2),
      PercentVolume: parseFloat(SMPercentAvgPE).toFixed(2),
    },
    [option.CALL]: {
      Volume: parseFloat(SMAvgCE).toFixed(2),
      PercentVolume: parseFloat(SMPercentAvgCE).toFixed(2),
    },
    tradeTime: parseInt(tradeTime),
    date: moment.unix(tradeTime).format("DD/MM/YYYY hh:mm:ss"),
  };
  return listItem;
}

function generateExpoAvg(volListItem, previousItem, tradeTime, duration) {
  const { CE, PE } = volListItem;

  const prevAvgCE = parseFloat(previousItem.CE.Volume);
  const prevPerAvgCE = parseFloat(previousItem.CE.PercentVolume);
  const prevAvgPE = parseFloat(previousItem.PE.Volume);
  const prevPerAvgPE = parseFloat(previousItem.PE.PercentVolume);
  const diffCE = parseFloat(parseFloat(CE.Volume) - prevAvgCE);
  const diffPerCE = parseFloat(
    parseFloat(CE.PercentVolume) - parseFloat(prevPerAvgCE)
  );
  const diffPE = parseFloat(parseFloat(PE.Volume) - prevAvgPE);
  const diffPerPE = parseFloat(
    parseFloat(PE.PercentVolume) - parseFloat(prevPerAvgPE)
  );
  const multiplier = parseFloat(2 / (parseInt(duration) + 1)); // duration (15, 30, 45, 60)
  const expoAvgCE = parseFloat(
    parseFloat(multiplier * diffCE) + parseFloat(prevAvgCE)
  ).toFixed(2);
  const expoPerAvgCE = parseFloat(
    parseFloat(multiplier * diffPerCE) + parseFloat(prevPerAvgCE)
  ).toFixed(2);
  const expoAvgPE = parseFloat(
    parseFloat(multiplier * diffPE) + parseFloat(prevAvgPE)
  ).toFixed(2);
  const expoPerAvgPE = parseFloat(
    parseFloat(multiplier * diffPerPE) + parseFloat(prevPerAvgPE)
  ).toFixed(2);

  let listItem = {
    [option.CALL]: {
      Volume: expoAvgCE,
      PercentVolume: expoPerAvgCE,
    },
    [option.PUT]: {
      Volume: expoAvgPE,
      PercentVolume: expoPerAvgPE,
    },
    tradeTime,
    date: moment.unix(tradeTime).format("DD/MM/YYYY hh:mm:ss"),
  };
  return listItem;
}

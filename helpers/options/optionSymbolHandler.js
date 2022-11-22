const option = require("../../constants/option");
const product = require("../../constants/product");
const { getLastWeeksThursday } = require("../dateTime/dateTimeHandler");
const { dataListNifty, dataListBankNifty } = require("../queue/dataQueue");
const {
  dataTickListNifty,
  dataTickListBankNifty,
} = require("../queue/dataTickQueue");

module.exports = {
  generateOptionSymbolsNifty: (isTickData) => {
    const dataList = isTickData ? dataTickListNifty : dataListNifty;

    let strikePrice = 0
    let tradeTime = 0;
    if(dataList.length === 0) {
      strikePrice = 0 
    }else {
      // take first item
      const snapshotItem = dataList[0];
      tradeTime = snapshotItem.LastTradeTime;
      strikePrice = isTickData
      ? snapshotItem.LastTradePrice
      : snapshotItem.Close;
    }

    const firstCall = roundNum(strikePrice, option.CALL, 50);
    const firstPut = roundNum(strikePrice, option.PUT, 50);
    let roundListCE = [firstCall];
    let roundListPE = [firstPut];
    let optionListPE = [];
    let optionListCE = [];
    let valueList = [50, 100, 150];
    valueList.forEach((item) => {
      const roundItemCE = firstCall - item;
      const roundItemPE = firstPut + item;
      roundListCE.push(roundItemCE);
      roundListPE.push(roundItemPE);
    });

    // generate option symbols for CE
    roundListCE.forEach((round) => {
      const optionSymbol = generateOptionSymbol(
        product.NIFTY,
        round,
        option.CALL
      );
      optionListCE.push(optionSymbol);
    });

    // generate option symbols for PE
    roundListPE.forEach((round) => {
      const optionSymbol = generateOptionSymbol(
        product.NIFTY,
        round,
        option.PUT
      );
      optionListPE.push(optionSymbol);
    });

    const item = {
      [product.NIFTY]: {
        [option.PUT]: optionListPE,
        [option.CALL]: optionListCE,
      },
      tradeTime: tradeTime,
    };
    // remove first element which was processed
    if (isTickData) {
      dataTickListNifty.shift();
    } else {
      dataListNifty.shift();
    }

    return item;
  },
  generateOptionSymbolsBankNifty: (isTickData) => {
    const dataList = isTickData ? dataTickListBankNifty : dataListBankNifty;

    let strikePrice = 0
    let tradeTime = 0
    if(dataList.length === 0) {
      strikePrice = 0
    }else {
      // take first item
      const snapshotItem = dataList[0];
      tradeTime = snapshotItem.LastTradeTime
      strikePrice = isTickData
      ? snapshotItem.LastTradePrice
      : snapshotItem.Close;
    }

    const firstCall = roundNum(strikePrice, option.CALL, 100);
    const firstPut = roundNum(strikePrice, option.PUT, 100);
    let roundListCE = [firstCall];
    let roundListPE = [firstPut];
    let optionListPE = [];
    let optionListCE = [];
    let valueList = [100, 200, 300];
    valueList.forEach((item) => {
      const roundItemCE = firstCall - item;
      const roundItemPE = firstPut + item;
      roundListCE.push(roundItemCE);
      roundListPE.push(roundItemPE);
    });

    // generate option symbols for CE
    roundListCE.forEach((round) => {
      const optionSymbol = generateOptionSymbol(
        product.BANKNIFTY,
        round,
        option.CALL
      );
      optionListCE.push(optionSymbol);
    });

    // generate option symbols for PE
    roundListPE.forEach((round) => {
      const optionSymbol = generateOptionSymbol(
        product.BANKNIFTY,
        round,
        option.PUT
      );
      optionListPE.push(optionSymbol);
    });

    const item = {
      [product.BANKNIFTY]: {
        [option.PUT]: optionListPE,
        [option.CALL]: optionListCE,
      },
      tradeTime: tradeTime,
    };

    // remove first element which was processed
    if(isTickData) {
      dataTickListBankNifty.shift()
    }else {
      dataListBankNifty.shift();
    }

    return item;
  },
};

function generateOptionSymbol(product, strikePrice, optionType) {
  const lastThuDay = getLastWeeksThursday();
  const formattedDate = lastThuDay.format("DDMMMYY");
  const capitalizedDate = formattedDate.toUpperCase();
  const optionSymbol = `${product}${capitalizedDate}${Math.abs(strikePrice)}${optionType}`;
  return optionSymbol;
}

function roundNum(num, _option, round) {
  let roundValue;
  if (_option === option.CALL) {
    roundValue = Math.ceil(num / round) * round;
  } else {
    roundValue = Math.floor(num / round) * round;
  }
  return roundValue;
}

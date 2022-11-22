const product = require("../constants/product");
const {socketFlag} = require("../constants/socketFlag");
const { saveSnapshot } = require("../controllers/database/snapshotController");
const { dataNifty, dataBankNifty } = require("../test/niftyData");
const { generateSumOfVolOptionListNifty, generateSumOfVolOptionListBankNifty } = require("./options/optionVolListHandler");
const { dataListNifty, dataListBankNifty } = require("./queue/dataQueue");

module.exports = {
  generateFeed: (ws) => {
    // pretend like a real time data with 1 min interval
    setInterval(() => {
      socketFlag.isNewSnapshot = true;
      socketFlag.isNewNiftySnapshot = true;
      const niftyItem = dataNifty.pop();
      dataListNifty.push(niftyItem);
      socketFlag.isNewBankNiftySnapshot = true;
      const bankItem = dataBankNifty.pop();
      dataListBankNifty.push(bankItem);
      // store snapshot to database
      //* (item, interval[30/60], exchangeName, )
      saveSnapshot(niftyItem, "60", product.NIFTY)
      saveSnapshot(bankItem, "60", product.BANKNIFTY)

    }, 8000);
  },
};

const { socketFlag } = require("../../constants/socketFlag");
const {
  GetOptionHistory,
  GetOptionTickHistory,
} = require("../../listeners/socketManager");

module.exports = {
  optionRequestNifty: (conn, data) => {
    const { NIFTY, tradeTime } = data;
    const { CE, PE } = NIFTY;
    CE.forEach((option, index) => {
      GetOptionHistory(conn, option, tradeTime, `NIFTY_CE_${index}`);
    });
    PE.forEach((option, index) => {
      GetOptionHistory(conn, option, tradeTime, `NIFTY_PE_${index}`);
    });
    socketFlag.isOptionNiftyFetched = true;
  },
  optionTickRequestNifty: (conn, data) => {
    const { NIFTY, tradeTime } = data;
    const { CE, PE } = NIFTY;
    const firstSnapshotTime = tradeTime - 29;
    const currentSnapshotTime = tradeTime;
    CE.forEach((option, index) => {
      GetOptionTickHistory(
        conn,
        option,
        firstSnapshotTime,
        currentSnapshotTime,
        `NIFTY_CE_${currentSnapshotTime}`
      );
    });
    PE.forEach((option, index) => {
      GetOptionTickHistory(
        conn,
        option,
        firstSnapshotTime,
        currentSnapshotTime,
        `NIFTY_PE_${currentSnapshotTime}`
      );
    });
    socketFlag.isOptionNiftyFetched = true;
  },
  optionRequestBankNifty: (conn, data) => {
    const { BANKNIFTY, tradeTime } = data;
    const { CE, PE } = BANKNIFTY;
    CE.forEach((option, index) => {
      GetOptionHistory(conn, option, tradeTime, `BANKNIFTY_CE_${index}`);
      // GetOptionTickHistory(conn, option, tradeTime, `BANKNIFTY_CE_${index}`);
    });
    PE.forEach((option, index) => {
      GetOptionHistory(conn, option, tradeTime, `BANKNIFTY_PE_${index}`);
      // GetOptionTickHistory(conn, option, tradeTime, `BANKNIFTY_PE_${index}`);
    });
    socketFlag.isOptionBankNiftyFetched = true;
  },
  optionTickRequestBankNifty: (conn, data) => {
    const { BANKNIFTY, tradeTime } = data;
    const { CE, PE } = BANKNIFTY;
    const firstSnapshotTime = tradeTime - 29;
    const currentSnapshotTime = tradeTime;
    CE.forEach((option, index) => {
      GetOptionTickHistory(
        conn,
        option,
        firstSnapshotTime,
        currentSnapshotTime,
        `BANKNIFTY_CE_${currentSnapshotTime}`
      );
    });
    PE.forEach((option, index) => {
      GetOptionTickHistory(
        conn,
        option,
        firstSnapshotTime,
        currentSnapshotTime,
        `BANKNIFTY_PE_${currentSnapshotTime}`
      );
    });
    socketFlag.isOptionBankNiftyFetched = true;
  },
};

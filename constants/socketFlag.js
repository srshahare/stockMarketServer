module.exports = {
  socketFlag: {
    isNewSnapshot: false,
    isNewNiftySnapshot: false,
    isNewBankNiftySnapshot: false,
    isOptionNiftyFetched: false,
    isOptionBankNiftyFetched: false,
    isOptionSumNiftyDone: false,
    isOptionSumBankNiftyDone: false,

    isExpoFinalDataNifty: false,
    isExpoFinalDataBankNifty: false
  },
  socketTickFlag: {
    isNewTickSnapshot: false,
    isNewTickNiftySnapshot: false,
    isNewTickBankNiftySnapshot: false,
    isOptionTickNiftyFetched: false,
    isOptionTickBankNiftyFetched: false,
    isOptionTickSumNiftyDone: false,
    isOptionTickSumBankNiftyDone: false,

    isExpoTickFinalData: false,
    isExpoTickFinalDataBankNifty: false,
  },
  socketInterval: {
    niftyPipeInterval: null,
    bankNiftyPipeInterval: null,
    niftyTickPipeInterval: null,
    bankNiftyTickPipeInterval: null,

    niftySumInterval: null,
    bankNiftySumInterval: null,
    niftyTickSumInterval: null,
    bankNiftyTickSumInterval: null,
    
    tickInterval: null,
    minuteInterval: null,

    tickMsgInterval: null,
    minuteMsgInterval: null
  },
};

module.exports = {
  // queue which takes the future data for NIFTY
  dataListNifty: [],
  // queue which takes the future data for BANKNIFTY
  dataListBankNifty: [],

  // queue which takes the option data for NIFTY
  optionReqListNifty: [],
  // queue which takes the option data for BANKNIFTY
  optionReqListBankNifty: [],

  // queue which takes the sum of 4 option vol for PE and CE for NIFTY
  optionVolListNifty: [],
  // single item
  // {
  //     NIFTY: {
  //         PE: [4 items {Volume: quantity}],
  //         CE: [4 items {Volume: quantity}]
  //     }
  // }
  // queue which takes the sum of 4 option vol for PE and CE for BANKNIFTY
  optionVolListBankNifty: [],

  finalListNifty: {
    15: [],
    30: [],
    45: [],
    60: [],
  },
  finalListBankNifty: {
    15: [],
    30: [],
    45: [],
    60: [],
  },
};

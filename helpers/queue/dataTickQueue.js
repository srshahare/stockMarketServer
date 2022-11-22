
module.exports = {
    // queue which takes the future data for NIFTY
    dataTickListNifty: [],
    // queue which takes the future data for BANKNIFTY
    dataTickListBankNifty: [],

    // queue which takes the option data for NIFTY
    optionTickReqListNifty: [],
    // queue which takes the option data for BANKNIFTY
    optionTickReqListBankNifty: [],

    // queue which takes the sum of 4 option vol for PE and CE for NIFTY
    optionTickVolListNifty: [],
    // single item 
    // {
    //     NIFTY: {
    //         PE: [4 items {Volume: quantity}],
    //         CE: [4 items {Volume: quantity}]
    //     }
    // }
    // queue which takes the sum of 4 option vol for PE and CE for BANKNIFTY
    optionTickVolListBankNifty: [],

    finalTickListNifty: {
        15: [],
        30: [],
        45: [],
        60: []
    },
    finalTicklListBankNifty: {
        15: [],
        30: [],
        45: [],
        60: []
    },
}
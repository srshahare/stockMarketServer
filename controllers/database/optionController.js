const db = require("../../models");

const Option = db.option;

module.exports = {
    saveOptionData: async (optionItem, interval, exchange, optionSymbol) => {
        try {
            const timestamp = String(optionItem.LastTradeTime)
            const optionData = JSON.stringify(optionItem)
            const data = {
                timeStamp: timestamp,
                exchangeName: exchange,
                optionSymbol,
                interval,
                optionData
            }
            const createdOption = await Option.create(data)
            return createdOption
        }catch(err) {
            console.log("Option Sum Save Error", err.message)
        }
    }
}
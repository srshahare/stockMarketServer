const product = require("../../constants/product");
const db = require("../../models");

const SumVolume = db.sumVolume;

module.exports = {
    saveSumVolumeData: async (volItem, interval, exchange) => {
        try {
            const timestamp = String(volItem.tradeTime)
            const volumeData = JSON.stringify(volItem)
            const data = {
                timeStamp: timestamp,
                exchangeName: exchange,
                futureIndex: exchange === product.NIFTY ? "NIFTY 50": "NIFTY BANK",
                interval,
                volumeData
            }
            const createdOption = await SumVolume.create(data)
            return createdOption
        }catch(err) {
            console.log("Volume Save Error", err.message)
        }
    }
}
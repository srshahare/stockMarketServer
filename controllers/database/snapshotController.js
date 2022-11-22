const product = require("../../constants/product");
const db = require("../../models");

const Snapshot = db.snapshot;

module.exports = {
    saveSnapshot: async (snapItem, interval, exchange) => {
        try {
            const timestamp = String(snapItem.LastTradeTime)
            const snapshotData = JSON.stringify(snapItem)
            const data = {
                timeStamp: timestamp,
                exchangeName: exchange,
                futureIndex: exchange === product.NIFTY ? "NIFTY 50": "NIFTY BANK",
                interval,
                snapshotData
            }
            const createdSnap = await Snapshot.create(data)
            return createdSnap
        }catch(err) {
            console.log("Snapshot Save Error", err.message)
        }
    }
}
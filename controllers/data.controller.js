const {fetchExpoAvgData} = require("./database/expoAvgController")
const moment = require("moment");
const { fetchSnapshots } = require("./database/snapshotController");

const fetchExpoData = async (req, res, next) => {
    try {   
        const { exchange, interval, duration } = req.body;
        const month = moment().month();
        const date = moment().date();
        const year = moment().year();
        const beginTime = moment([year, month, 03, 9, 15, 00, 00]); 
        const result = await fetchExpoAvgData(exchange, interval, duration, beginTime)
        
        res.json({
            status: 200,
            data: result
        })
    }catch(err) {
        console.log(err)
    }
}

const fetchIndexData = async (req, res, next) => {
    try {   
        const month = moment().month();
        const date = moment().date();
        const year = moment().year();
        const beginTime = moment([year, month, 03, 9, 15, 00, 00]); 
        const result = await fetchSnapshots("NIFTY", "60", beginTime)
        res.json({
            status: 200,
            data: result
        })
    }catch(err) {
        console.log(err)
    }
}

module.exports = {
    fetchExpoData,
    fetchIndexData
}
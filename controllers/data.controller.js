const {fetchExpoAvgData} = require("./database/expoAvgController")
const moment = require("moment")

const fetchExpoData = async (req, res, next) => {
    try {   

        const month = moment().month();
        const date = moment().date();
        const year = moment().year();
        const beginTime = moment([year, month, 24, 9, 15, 00, 00]); 
        const result = await fetchExpoAvgData("NIFTY", "60", "15", beginTime)
        
        res.json({
            status: 200,
            date: result
        })
    }catch(err) {
        console.log(err)
    }
}

module.exports = {
    fetchExpoData
}
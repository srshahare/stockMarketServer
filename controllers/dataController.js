const { GetInstruments } = require("../listeners/socketManager");

let initialPoints = [];
let tempSum = 0;
let previousAvg = 0;
let finalData = [];

module.exports = {
  formatFinalData: (data) => {
    try {
      if (data.length === 0) {
        return;
      }

      // current interval is 15 min
      data.map((point, index) => {
        initialPoints.push(point);
        if (index === 14) {
          initialPoints.push(point);
          previousAvg = calculateSimpleAvg(initialPoints);
        }
        if (index === 15) {
          finalData.push({
            tradeTime: point.tradeTime,
            avg: previousAvg,
          });
        }
        if (index > 15) {
          let sumOfDiffCE = Math.abs(
            parseFloat(point.volume) - parseFloat(previousAvg)
          );
          let multiPlier = 2 / (15 + 1);
          let expoAvg = multiPlier * sumOfDiffCE + previousAvg;
          finalData.push({
            tradeTime: point.tradeTime,
            avg: expoAvg,
          });
          previousAvg = expoAvg;
        }
      });

      return finalData;
    } catch (err) {
      console.log(err);
    }
  },
};

function calculateSimpleAvg(data) {
  data.forEach((item) => {
    const vol = item.volume;
    tempSum = tempSum + vol;
  });

  return parseFloat(tempSum / 15);
}

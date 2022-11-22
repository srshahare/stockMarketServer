const { getLastMonthsThursday } = require("../dateTime/dateTimeHandler");

module.exports = {
  generateInstrumentId: (product) => {
    const lastThuDay = getLastMonthsThursday()
    const formattedDate = lastThuDay.format("DDMMMYYYY")
    const capitalizedDate = formattedDate.toUpperCase()
    const instrumentId = `FUTIDX_${product}_${capitalizedDate}_XX_0`
    return instrumentId;
  },
};

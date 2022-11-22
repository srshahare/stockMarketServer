const { GetInstruments } = require("../listeners/socketManager");

module.exports = {
  fetchInstrumentId: (result) => {
    try {
      let instrumentId = "";
      if (result.length > 0) {
        const instrument = result[0];
        if (!instrument) {
          return "";
        }

        // get the instrument if from instrument
        instrumentId = instrument.Identifier;
      }

      return instrumentId;
    } catch (err) {
      console.log(err);
    }
  },
};

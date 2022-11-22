const { GET_INSTRUMENTS, GET_HISTORY, GET_FUTURE_HISTORY, GET_OPTION_HISTORY, SUBSCRIBE_REAL_TIME, SUBSCRIBE_SNAPSHOT } = require("../constants/types");
const { GetInstruments, GetHistory, SubscribeRealtime, SubscribeSnapshot } = require("../listeners/socketManager")

module.exports = {
  handleFunctionCalls: (connection, type) => {
    switch (type) {
      case GET_INSTRUMENTS:
        GetInstruments(connection); //GFDL : Returns array of instruments by selected exchange
        break;
      case GET_HISTORY:
        GetHistory(connection); //GFDL : Returns array of instruments by selected exchange
        break;
      case SUBSCRIBE_REAL_TIME:
        SubscribeRealtime(connection)
        break;
      case SUBSCRIBE_SNAPSHOT:
        SubscribeSnapshot(connection)
        break;
      default:
        return 0;
    }

    //SubscribeRealtime();					//GFDL : Subscribes to realtime data (server will push new data whenever available)
    //SubscribeSnapshot();					//GFDL : Subscribes to minute snapshot data (server will push new data whenever available)
    //GetLastQuote();						//GFDL : Returns LastTradePrice of Single Symbol (detailed)
    //GetLastQuoteShort();					//GFDL : Returns LastTradePrice of Single Symbol (short)
    //GetLastQuoteShortWithClose();			//GFDL : Returns LastTradePrice of Single Symbol (short) with Close of Previous Day
    //GetLastQuoteArray();					//GFDL : Returns LastTradePrice of multiple Symbols – max 25 in single call (detailed)
    //GetLastQuoteArrayShort();				//GFDL : Returns LastTradePrice of multiple Symbols – max 25 in single call (short)
    //GetLastQuoteArrayShortWithClose();	//GFDL : Returns LastTradePrice of multiple Symbols – max 25 in single call (short) with Previous Close
    //GetSnapshot();						//GFDL : Returns latest Snapshot Data of multiple Symbols – max 25 in single call
    //GetHistory();							//GFDL : Returns historical data (Tick / Minute / EOD)
    //GetExchanges();						//GFDL : Returns array of available exchanges configured for API Key
    //GetInstrumentsOnSearch();				//GFDL : Returns array of max. 20 instruments by selected exchange and 'search string'

    //GetInstrumentTypes();					//GFDL : Returns list of Instrument Types (e.g. FUTIDX, FUTSTK, etc.)
    //GetProducts();						//GFDL : Returns list of Products (e.g. NIFTY, BANKNIFTY, GAIL, etc.)
    //GetExpiryDates();						//GFDL : Returns array of Expiry Dates (e.g. 25JUN2020, 30JUL2020, etc.)
    //GetOptionTypes();						//GFDL : Returns list of Option Types (e.g. CE, PE, etc.)
    //GetStrikePrices();					//GFDL : Returns list of Strike Prices (e.g. 10000, 11000, 75.5, etc.)
    //GetServerInfo();						//GFDL : Returns the server endpoint where user is connected
    //GetLimitation();						//GFDL : Returns user account information (functions allowed, Exchanges allowed, symbol limit, etc.)
    //GetMarketMessages();					//GFDL : Returns array of last messages (Market Messages) related to selected exchange
    //GetExchangeMessages();				//GFDL : Returns array of last messages (Exchange Messages) related to selected exchange
    //GetLastQuoteOptionChain();			//GFDL : Returns OptionChain data in realtime
    //GetExchangeSnapshot();				//GFDL : Returns entire Exchange Snapshot in realtime
    // GetLastQuoteOptionGreeks();			//GFDL : Returns Last Traded Option Greek values of Single Symbol (detailed)
    // GetLastQuoteArrayOptionGreeks();		//GFDL : Returns Last Traded Option Greek values of multiple Symbols – max 25 in single call (detailed)
    // GetLastQuoteOptionGreeksChain();		//GFDL : Returns Last Traded Option Greek values of entire OptionChain of requested underlying
    //GetExchangeSnapshotAfterMarket();		//GFDL : Returns entire Exchange Snapshot after market.
  },
};

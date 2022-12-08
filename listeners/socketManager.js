let request;

function callAPI(request, connection) {
  if (connection.connected) {
    connection.sendUTF(request);
  }
}

module.exports = {
  SubscribeSnapshot: (connection, instrumentId, unsubscribe) => {
    if (connection.connected) {
      var ExchangeName = "NSE_IDX"; //GFDL : Supported Values : NFO, NSE, NSE_IDX, CDS, MCX. Mandatory Parameter
      // var InstIdentifier = "NIFTY-I";
      var InstIdentifier = instrumentId;
      var Periodicity = "Minute"; //GFDL : Supported values are : Minute, Hour
      var Period = 1; //GFDL : Supported values are : 1,2,5,10,15,30 (for Minute Periodicity ONLY)
      var Unsubscribe = unsubscribe; //GFDL : To stop data subscription for this symbol, send this value as "true"

      request =
        '{"MessageType":"SubscribeSnapshot","Exchange":"' +
        ExchangeName +
        '","InstrumentIdentifier":"' +
        InstIdentifier +
        '","Periodicity":"' +
        Periodicity +
        '","Period":' +
        Period +
        ',"Unsubscribe":"' +
        Unsubscribe +
        '"}';
      callAPI(request, connection);
    }
  },

  SubscribeRealtime: (connection, instrumentId) => {
    if (connection.connected) {
      var ExchangeName = "NSE_IDX"; //GFDL : Supported values : NSE (stocks), NSE_IDX (Indices), NFO (F&O), MCX & CDS (Currency)
      var InstIdentifier = instrumentId; //GFDL : NIFTY-I always represents current month Futures.
      request =
        '{"MessageType":"SubscribeRealtime","Exchange":"' +
        ExchangeName +
        '","InstrumentIdentifier":"' +
        InstIdentifier +
        '"}';
      callAPI(request, connection);
    }
  },

  GetLastQuote: (connection) => {
    if (connection.connected) {
      var ExchangeName = "NFO";
      var InstIdentifier = "NIFTY-I";
      var isShortIdentifier = "false"; //GFDL : When using contractwise symbol like NIFTY20JULFUT,
      //this argument must be sent with value "true"

      request =
        '{"MessageType":"GetLastQuote","Exchange":"' +
        ExchangeName +
        '","isShortIdentifier":"' +
        isShortIdentifier +
        '","InstrumentIdentifier":"' +
        InstIdentifier +
        '"}';
      callAPI(request, connection);
    }
  },

  GetLastQuoteShort: (connection) => {
    if (connection.connected) {
      var ExchangeName = "NFO";
      var InstIdentifier = "NIFTY-I";
      var isShortIdentifier = "false"; //GFDL : When using contractwise symbol like NIFTY20JULFUT,
      //this argument must be sent with value "true"

      request =
        '{"MessageType":"GetLastQuoteShort","Exchange":"' +
        ExchangeName +
        '","isShortIdentifier":"' +
        isShortIdentifier +
        '","InstrumentIdentifier":"' +
        InstIdentifier +
        '"}';
      callAPI(request, connection);
    }
  },

  GetLastQuoteShortWithClose: (connection) => {
    if (connection.connected) {
      var ExchangeName = "NFO";
      var InstIdentifier = "NIFTY20JULFUT"; //GFDL : If this contract is expired, please use other contract
      var isShortIdentifier = "true"; //GFDL : When using contractwise symbol like NIFTY20JULFUT,
      //this argument must be sent with value "true"

      request =
        '{"MessageType":"GetLastQuoteShortWithClose","Exchange":"' +
        ExchangeName +
        '","isShortIdentifier":"' +
        isShortIdentifier +
        '","InstrumentIdentifier":"' +
        InstIdentifier +
        '"}';
      callAPI(request, connection);
    }
  },

  GetLastQuoteArray: (connection) => {
    if (connection.connected) {
      var ExchangeName = "NSE";
      var InstIdentifier = '[{"Value":"TATAPOWER"}, {"Value":"RELIANCE"}]';
      var isShortIdentifiers = "false"; //GFDL : When using contractwise symbol like NIFTY20JULFUT,
      //this argument must be sent with value "true"

      request =
        '{"MessageType":"GetLastQuoteArray","Exchange":"' +
        ExchangeName +
        '","isShortIdentifiers":' +
        isShortIdentifiers +
        '","InstrumentIdentifiers":' +
        InstIdentifier +
        "}";
      callAPI(request, connection);
    }
  },

  GetOptionHistory: (connection, instIdentifier, tradeTime, tag) => {
    if (connection.connected) {
      var ExchangeName = "NFO";
      var InstIdentifier = instIdentifier;
      var Periodicity = "MINUTE";
      var Period = 1;
      var Max = 1;
      var isShortIdentifier = "true";
      var From = tradeTime;
      var To = tradeTime;
      var userTag = tag;
      const request = `{"MessageType":"GetHistory","Exchange":"${ExchangeName}","InstrumentIdentifier":"${InstIdentifier}","Periodicity":"${Periodicity}","Period":"${Period}","From":${From},"To":${To},"isShortIdentifier":"${isShortIdentifier}","userTag":"${userTag}"}`;
      callAPI(request, connection);
    }
  },
  GetOptionTickHistory: (connection, instIdentifier, fromTime, toTime, tag) => {
    if (connection.connected) {
      var ExchangeName = "NFO";
      var InstIdentifier = instIdentifier;
      var Periodicity = "Tick";
      var Period = 1;
      var Max = 30;
      var isShortIdentifier = "true";
      var From = fromTime;
      var To = toTime;
      var userTag = tag;
      const request = `{"MessageType":"GetHistory","Exchange":"${ExchangeName}","InstrumentIdentifier":"${InstIdentifier}","Periodicity":"${Periodicity}","From":${From},"To":${To},"isShortIdentifier":"${isShortIdentifier}","userTag":"${userTag}"}`;

      callAPI(request, connection);
    }
  },

  GetFutureHistory: (connection, instIdentifier, from, to, userTag) => {
    if (connection.connected) {
      var ExchangeName = "NSE_IDX";
      var InstIdentifier = instIdentifier;
      var Periodicity = "MINUTE";
      var Period = 1;
      var Max = 376;
      var isShortIdentifier = "false";
      var From = from;
      var To = to;
      var userTag = userTag;
      // const request = `{"MessageType":"GetHistory","Exchange":"${ExchangeName}","InstrumentIdentifier":"${InstIdentifier}","Periodicity":"${Periodicity}","Period":"${Period}","From":${From},"To":${to},"isShortIdentifier":"${isShortIdentifier}"}`;
      const request = `{"MessageType":"GetHistory","Exchange":"${ExchangeName}","InstrumentIdentifier":"${InstIdentifier}","Periodicity":"${Periodicity}","Period":"${Period}","From":${From},"To":${To},"isShortIdentifier":"${isShortIdentifier}","userTag":"${userTag}"}`;

      callAPI(request, connection);
    }
  },
  GetFutureTickHistory: (connection, instIdentifier, from, to, userTag) => {
    if (connection.connected) {
      // var ExchangeName = "NFO";
      var ExchangeName = "NSE_IDX";
      var InstIdentifier = instIdentifier;
      var Periodicity = "Tick";
      var Period = 1;
      var Max = 376;
      var isShortIdentifier = "false";
      var From = from;
      var To = to;
      var userTag = userTag;
      // const request = `{"MessageType":"GetHistory","Exchange":"${ExchangeName}","InstrumentIdentifier":"${InstIdentifier}","Periodicity":"${Periodicity}","Period":"${Period}","From":${From},"To":${to},"isShortIdentifier":"${isShortIdentifier}"}`;
      const request = `{"MessageType":"GetHistory","Exchange":"${ExchangeName}","InstrumentIdentifier":"${InstIdentifier}","Periodicity":"${Periodicity}","Period":"${Period}","From":${From},"To":${To},"isShortIdentifier":"${isShortIdentifier}","userTag":"${userTag}"}`;

      callAPI(request, connection);
    }
  },

  GetExchangesL: (connection) => {
    if (connection.connected) {
      request = '{"MessageType":"GetExchanges"}';
      callAPI(request, connection);
    }
  },

  GetInstruments: (connection) => {
    if (connection.connected) {
      var ExchangeName = "NFO";
      var InstrumentType = "FUTIDX"; //GFDL : Optional argument to filter the search by products like FUTIDX, FUTSTK, OPTIDX, OPTSTK,
      //FUTCUR, FUTCOM, etc.
      var Product = "NIFTY"; //GFDL : Optional argument to filter the search by products like NIFTY, RELIANCE, etc.
      var OptionType = "PE"; //GFDL : Optional argument to filter the search by OptionTypes like CE, PE
      var Expiry = "24NOV2022"; //GFDL : Optional argument to filter the search by Expiry like 30JUL2020
      var StrikePrice = 10000; //GFDL : Optional argument to filter the search by Strike Price like 10000, 75.5, 1250, etc.
      var OnlyActive = "TRUE"; //GFDL : Optional argument (default=True) to control returned data. If false,
      //       even expired contracts are returned

      const request = `{"MessageType":"GetInstruments","Exchange":"${ExchangeName}","InstrumentType":"${InstrumentType}","Product":"${Product}","Expiry":"${Expiry}"}`;
      callAPI(request, connection);
    }
  },

  GetOptionTypes: (connection) => {
    if (connection.connected) {
      var ExchangeName = "NFO";
      request =
        '{"MessageType":"GetOptionTypes","Exchange":"' + ExchangeName + '"}';
      callAPI(request, connection);
    }
  },
};

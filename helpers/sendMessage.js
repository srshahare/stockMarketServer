const product = require("../constants/product");
const { finalListNifty, finalListBankNifty } = require("./queue/dataQueue");
const { finalTickListNifty, finalTicklListBankNifty } = require("./queue/dataTickQueue");

module.exports = {
  sendWSMessage: (wss, data) => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === true) {
        const { subscribe, duration, requestType, exchange } = ws?.messageData;
        if (subscribe === true) {
          switch(requestType) {
            case "GetMinuteData":
              if(exchange === product.NIFTY) {
                const msgData = {
                  MessageType: "GetMinuteData",
                  Request: {
                    count: finalListNifty[duration].length,
                    Interval: "60",
                    Exchange: exchange,
                    Duration: duration,
                  },
                  Result: data,
                };
                ws.send(JSON.stringify(msgData));
              }else {
                const msgData = {
                  MessageType: "GetMinuteData",
                  Request: {
                    count: finalListBankNifty[duration].length,
                    Interval: "60",
                    Exchange: exchange,
                    Duration: duration,
                  },
                  Result: data,
                };
                ws.send(JSON.stringify(msgData));
              }
              break;
            case "GetTickData":
              if(exchange === product.NIFTY) {
                const msgData = {
                  MessageType: "GetTickData",
                  Request: {
                    count: finalTickListNifty[duration].length,
                    Interval: "30",
                    Exchange: exchange,
                    Duration: duration,
                  },
                  Result: data,
                };
                ws.send(JSON.stringify(msgData));
              }else {
                const msgData = {
                  MessageType: "GetTickData",
                  Request: {
                    count: finalTicklListBankNifty[duration].length,
                    Interval: "30",
                    Exchange: exchange,
                    Duration: duration,
                  },
                  Result: data,
                };
                ws.send(JSON.stringify(msgData));
              }
              break;
            default:
              const msgData = {
                MessageType: "RequestError",
                Result: data,
              };
              ws.send(JSON.stringify(msgData));
          }
        }else {
          const msgData = {
            MessageType: "RequestError",
            Result: data,
          };
          ws.send(JSON.stringify(msgData));
        }
      }
    });
  },
};

const moment = require("moment");
const product = require("../constants/product");
const types = require("../constants/types");
const {
  finalListNifty,
  finalListBankNifty,
  optionVolListNifty,
  optionVolListBankNifty,
  indexListNifty,
  indexListBankNifty,
} = require("./queue/dataQueue");
const {
  finalTickListNifty,
  finalTicklListBankNifty,
  optionTickVolListNifty,
  optionTickVolListBankNifty,
} = require("./queue/dataTickQueue");

module.exports = {
  sendWSMessage: (wss, data) => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === true) {
        const { subscribe, duration, requestType, exchange } = ws?.messageData;
        if (subscribe === true) {
          let msgData = "";
          if (exchange === "Both" && requestType === types.GetBothData) {
            if (data.interval === "60" && data.dataType === "ExpoAverage") {
              if (data.duration === duration) {
                if (data.exchange === product.NIFTY) {
                  const niftyData = {
                    MessageType: "GetMinuteData",
                    Request: {
                      count: finalListNifty[duration].length,
                      Interval: "60",
                      Exchange: product.NIFTY,
                      Duration: duration,
                    },
                    Result: data,
                  };
                  ws.send(JSON.stringify(niftyData));
                } else {
                  const bankData = {
                    MessageType: "GetMinuteData",
                    Request: {
                      count: finalListBankNifty[duration].length,
                      Interval: "60",
                      Exchange: product.BANKNIFTY,
                      Duration: duration,
                    },
                    Result: data,
                  };
                  ws.send(JSON.stringify(bankData));
                }
              }
            }
          } else if (
            exchange === product.NIFTY &&
            data.exchange === product.NIFTY
          ) {
            switch (requestType) {
              case types.GetMinuteData:
                if (data.interval === "60" && data.dataType === "ExpoAverage") {
                  if (data.duration === duration) {
                    msgData = {
                      MessageType: "GetMinuteData",
                      Request: {
                        count: finalListNifty[duration].length,
                        Interval: "60",
                        Exchange: exchange,
                        Duration: duration,
                      },
                      Result: data,
                    };
                  }
                }
                break;
              case types.GetIndexData:
                if (data.interval === "60" && data.dataType === "IndexData") {
                  if (data.duration === duration) {
                    msgData = {
                      MessageType: "GetIndexData",
                      Request: {
                        count: indexListNifty.length,
                        Interval: "60",
                        Exchange: exchange,
                        Duration: duration,
                      },
                      Result: data,
                    };
                  }
                }
                break;
              case types.GetTickData:
                if (data.interval === "30" && data.dataType === "ExpoAverage") {
                  if (data.duration === duration) {
                    msgData = {
                      MessageType: "GetTickData",
                      Request: {
                        count: finalTickListNifty[duration].length,
                        Interval: "30",
                        Exchange: exchange,
                        Duration: duration,
                      },
                      Result: data,
                    };
                  }
                }
                break;
              case types.GetMinuteVolData:
                if (data.interval === "60" && data.dataType === "SumVolume") {
                  msgData = {
                    MessageType: "GetMinuteVolData",
                    Request: {
                      count: optionVolListNifty.length,
                      Interval: "60",
                      Exchange: exchange,
                      Duration: duration,
                    },
                    Result: data,
                  };
                }
                break;
              case types.GetTickVolData:
                if (data.interval === "30" && data.dataType === "SumVolume") {
                  msgData = {
                    MessageType: "GetTickVolData",
                    Request: {
                      count: optionTickVolListNifty.length,
                      Interval: "30",
                      Exchange: exchange,
                      Duration: duration,
                    },
                    Result: data,
                  };
                }
                break;
              default:
                msgData = {
                  MessageType: "RequestError",
                  Result: {
                    Message:
                      "Wrong Request Type! (GetMinuteData, GetTickData, GetMinuteVolData, GetTickVolData) these are only valid requestTypes.",
                  },
                };
            }
          } else if (
            exchange === product.BANKNIFTY &&
            data.exchange === product.BANKNIFTY
          ) {
            switch (requestType) {
              case types.GetMinuteData:
                if (data.interval === "60" && data.dataType === "ExpoAverage") {
                  if (data.duration === duration) {
                    msgData = {
                      MessageType: "GetMinuteData",
                      Request: {
                        count: finalListBankNifty[duration].length,
                        Interval: "60",
                        Exchange: exchange,
                        Duration: duration,
                      },
                      Result: data,
                    };
                  }
                }
                break;
              case types.GetIndexData:
                if (data.interval === "60" && data.dataType === "IndexData") {
                  if (data.duration === duration) {
                    msgData = {
                      MessageType: "GetIndexData",
                      Request: {
                        count: indexListBankNifty.length,
                        Interval: "60",
                        Exchange: exchange,
                        Duration: duration,
                      },
                      Result: data,
                    };
                  }
                }
                break;
              case types.GetTickData:
                if (data.interval === "30" && data.dataType === "ExpoAverage") {
                  if (data.duration === duration) {
                    msgData = {
                      MessageType: "GetTickData",
                      Request: {
                        count: finalTicklListBankNifty[duration].length,
                        Interval: "30",
                        Exchange: exchange,
                        Duration: duration,
                      },
                      Result: data,
                    };
                  }
                }
                break;
              case types.GetMinuteVolData:
                if (data.interval === "60" && data.dataType === "SumVolume") {
                  const msgData = {
                    MessageType: "GetTickVolData",
                    Request: {
                      count: optionTickVolListBankNifty.length,
                      Interval: "30",
                      Exchange: exchange,
                      Duration: duration,
                    },
                    Result: data,
                  };
                }
                break;
              case types.GetTickVolData:
                if (data.interval === "30" && data.dataType === "SumVolume") {
                  const msgData = {
                    MessageType: "GetTickVolData",
                    Request: {
                      count: optionTickVolListBankNifty.length,
                      Interval: "30",
                      Exchange: exchange,
                      Duration: duration,
                    },
                    Result: data,
                  };
                }
                break;
              default:
                msgData = {
                  MessageType: "RequestError",
                  Result: {
                    Message:
                      "Wrong Exchange Name! (NIFTY, BANKNIFTY) these are only valid exchanges.",
                  },
                };
            }
          }
          if (requestType === "ServerInfo") {
            msgData = {
              Request: {
                MessageType: "ServerInfo",
                date: moment().toDate(),
              },
              Result: {
                message: data,
              },
            };
            ws.send(JSON.stringify(msgData));
          }
          if (msgData !== "") {
            ws.send(JSON.stringify(msgData));
          }
        }
      }
    });
  },
};

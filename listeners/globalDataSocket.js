const moment = require("moment");
const schedule = require("node-schedule");
var websocketClient = require("websocket").client;
const messageTypes = require("../constants/messageTypes");
const {
  socketFlag,
  socketTickFlag,
  socketInterval,
} = require("../constants/socketFlag");
const types = require("../constants/types");
const {
  minuteReqController,
  tickReqController,
} = require("../controllers/request/intervalReqController");
const {
  dataListNifty,
  dataListBankNifty,
  optionReqListNifty,
  optionReqListBankNifty,
  optionVolListNifty,
  optionVolListBankNifty,
  finalListNifty,
  finalListBankNifty,
} = require("../helpers/queue/dataQueue");
const product = require("../constants/product");
const {
  dataTickListNifty,
  dataTickListBankNifty,
  optionTickReqListNifty,
  optionTickReqListBankNifty,
  finalTickListNifty,
  finalTicklListBankNifty,
  optionTickVolListNifty,
  optionTickVolListBankNifty,
} = require("../helpers/queue/dataTickQueue");
const { saveOptionData } = require("../controllers/database/optionController");
const { saveSnapshot } = require("../controllers/database/snapshotController");
const {
  fetchLatestExpoAvgData,
} = require("../controllers/database/expoAvgController");

var client = new websocketClient();

module.exports = {
  globalDataSocketInstance: (wsClient) => {
    var endpoint = "ws://nimblewebstream.lisuns.com:4575/";
    var accesskey = "2cdf0c7e-aedd-4e33-897e-bfe99951fd53";

    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(1, 5)];
    rule.hour = 9;
    rule.minute = 14;

    client.on("connectFailed", function (error) {
      console.log(error);
      console.log("Connection Error: " + error.toString());
    });

    wsClient.on("connection", (socket, req) => {
      socket.isAlive = true;
      const serverData = {
        requestType: "",
        exchange: "",
        duration: "",
        subscribe: false,
        callDone: false,
      };
      socket.messageData = serverData;

      socket.on("pong", () => {
        heartbeat(socket);
      });

      // listener for this server messages
      socket.on("message", async function incoming(data) {
        var callDone = false;

        if (callDone == false) {
          const serverData = JSON.parse(data.toString());
          const { requestType, exchange, duration } = serverData;
          socket.messageData = serverData;
          try {
            if (!requestType || !exchange || !duration) {
              return socket.send(
                JSON.stringify({
                  MessageType: "RequestError",
                  message:
                    "requestType, exchange, duration (Required Parameters)",
                })
              );
            }
            if (requestType === "Restart") {
              client.connect(endpoint);
            }
            if (requestType === types.GetMinuteData) {
              // send first chunk of data
              const d = await fetchLatestExpoAvgData(exchange, "60", duration);
              console.log("db data,", d);
              // const refactoredData = await refactorFinalData(data, "expo");
              const data =
                exchange === product.NIFTY
                  ? finalListNifty[duration]
                  : finalListBankNifty[duration];
              const msgData = {
                MessageType: "GetMinuteData",
                Request: {
                  count: data.length,
                  Interval: "60",
                  Exchange: exchange,
                  Duration: duration,
                },
                Result: data,
              };
              socket.send(JSON.stringify(msgData));
              callDone = true;
            } else if (requestType === types.GetTickData) {
              // send first chunk of data
              // const data = await fetchLatestExpoAvgData(
              //   exchange,
              //   "30",
              //   duration
              // );
              // const refactoredData = await refactorFinalData(data, "expo");
              const data =
                exchange === product.NIFTY
                  ? finalTickListNifty[duration]
                  : finalTicklListBankNifty[duration];
              const msgData = {
                MessageType: "GetTickData",
                Request: {
                  count: data.length,
                  Interval: "30",
                  Exchange: exchange,
                  Duration: duration,
                },
                Result: data,
              };
              socket.send(JSON.stringify(msgData));
              callDone = true;
            } else if (requestType === types.GetMinuteVolData) {
              // send first chunk of data
              // const data = await fetchLatestVolumeData(exchange, "60");
              // const refactoredData = await refactorFinalData(data, "vol");
              const data =
                exchange === product.NIFTY
                  ? optionVolListNifty
                  : optionVolListBankNifty;
              const msgData = {
                MessageType: "GetMinuteVolData",
                Request: {
                  count: data.length,
                  Interval: "60",
                  Exchange: exchange,
                  Duration: duration,
                },
                Result: data,
              };

              socket.send(JSON.stringify(msgData));
              callDone = true;
            } else if (requestType === types.GetTickVolData) {
              // send first chunk of data
              // const data = await fetchLatestVolumeData(exchange, "30");
              // const refactoredData = await refactorFinalData(data, "vol");
              const data =
                exchange === product.NIFTY
                  ? optionTickVolListNifty
                  : optionTickVolListBankNifty;
              const msgData = {
                MessageType: "GetTickVolData",
                Request: {
                  count: data.length,
                  Interval: "30",
                  Exchange: exchange,
                  Duration: duration,
                },
                Result: data,
              };
              socket.send(JSON.stringify(msgData));
              callDone = true;
            } else {
              socket.send(
                JSON.stringify({
                  MessageType: "RequestError",
                  message: "No such message type exists!",
                })
              );
            }
          } catch (err) {
            socket.send(
              JSON.stringify({
                MessageType: "RequestError",
                message: err.message,
              })
            );
          }
        }
      });

      socket.on("error", function (error) {
        console.log("Connection Error: ", error);
      });
    });

    const heartbeat = (ws) => {
      ws.isAlive = true;
    };

    const ping = (ws) => {
      const data = {
        MessageType: "Beat",
      };
      const parsedData = JSON.stringify(data);
      ws.send(parsedData);
    };

    const interval = setInterval(() => {
      wsClient.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(() => {
          ping(ws);
        });
      });
    }, 2000);

    client.on("connect", function (connection) {
      console.log("connection established");
      var AuthConnect = false;
      var callDone = false;
      var initialized = false;
      let mainInterval = null;

      Authenticate();

      //Todo remove comment
      setTimeout(() => {
        let tempInterval;
        tempInterval = setInterval(() => {
          if (AuthConnect && !initialized) {
            initialized = true;
            console.log("controllers initiated!, ", moment().utcOffset(330));
            const rule = new schedule.RecurrenceRule();
            rule.tz = "Asia/Kolkata"
            rule.dayOfWeek = [0, new schedule.Range(1, 5)];
            rule.hour = 9;
            rule.minute = 15;
            console.log("minute controller initiated successfull!");
            minuteReqController(connection, wsClient);
            tickReqController(connection, wsClient);
            const reqJbo = schedule.scheduleJob("reqJob", rule, () => {
              console.log("tick controller initiated successfull!");
            });
          } else if (!AuthConnect || !initialized) {
            Authenticate();
          } else {
            clearInterval(tempInterval);
          }
        }, 5000); // check if user is authenticated after each 5 sec
      }, 8000); // wait for 30 seconds

      // Todo minute interval
      mainInterval = setInterval(() => {
        const currentTime = moment().utcOffset(330).toDate(); // 330 hours for 5:30 GMT offset
        const closeTime = moment().utcOffset(330)
          .set("hour", 15)
          .set("minute", 31)
          .set("second", 00);
        const closeTimestamp = closeTime.unix();
        // Todo make it greater than
        if (currentTime < closeTimestamp) {
          // close the socket
          console.log("Global data instance is stopping!", moment().utcOffset(330).toDate());
          // clear all the intervals
          const {
            niftyPipeInterval,
            bankNiftyPipeInterval,
            niftyTickPipeInterval,
            bankNiftyTickPipeInterval,
            tickInterval,
            minuteInterval,
            tickMsgInterval,
            minuteMsgInterval,
          } = socketInterval;
          clearInterval(niftyPipeInterval);
          clearInterval(bankNiftyPipeInterval);
          clearInterval(niftyTickPipeInterval);
          clearInterval(bankNiftyTickPipeInterval);
          clearInterval(tickInterval);
          clearInterval(minuteInterval);
          clearInterval(tickMsgInterval);
          clearInterval(minuteMsgInterval);
          clearInterval(mainInterval);

          // clear all the queues
          optionVolListNifty.splice(0, optionVolListNifty.length);
          optionVolListBankNifty.splice(0, optionVolListBankNifty.length);
          optionTickVolListNifty.splice(0, optionTickVolListNifty.length);
          optionTickVolListBankNifty.splice(
            0,
            optionTickVolListBankNifty.length
          );
          let elList = [15, 30, 45, 60];
          elList.forEach((dur) => {
            finalListNifty[dur].splice(0, finalListNifty[dur].length);
            finalListBankNifty[dur].splice(0, finalListBankNifty[dur].length);
            finalTickListNifty[dur].splice(0, finalTickListNifty[dur].length);
            finalTicklListBankNifty[dur].splice(
              0,
              finalTicklListBankNifty[dur].length
            );
          });

          // close the global data feed connection
          setTimeout(() => {
            doClose();
          }, 5000);
        }
      }, 60000);

      connection.on("error", function (error) {
        console.log("Connection Error: " + error.toString());
      });
      connection.on("close", function () {
        console.log("Connection Closed");
      });

      // listener for global data feed messages
      connection.on("message", function (message) {
        if (message.type === "utf8") {
          AuthConnect = true;
          // get instruments for next thrusday expiry
          const { utf8Data } = message;
          const data = JSON.parse(utf8Data);

          if (data.MessageType !== "Echo") {
            // wsClient.clients.forEach(ws => {
            //   ws.send(JSON.stringify(data))
            // })
          }

          // storing NIFTY & BANKNIFTY 1 min snapshots
          // Todo : check the if stmt again to generate real time snapshot
          if (data.MessageType === messageTypes.RealtimeSnapshotResult) {
            socketFlag.isNewSnapshot = true;
            // const instrumentIdNifty = generateInstrumentId("NIFTY");
            const instrumentIdNifty = "NIFTY 50";

            if (data.InstrumentIdentifier === instrumentIdNifty) {
              dataListNifty.push(data);
              socketFlag.isNewNiftySnapshot = true;
              socketFlag.isExpoFinalDataNifty = false;
              saveSnapshot(data, "60", product.NIFTY);
            } else {
              dataListBankNifty.push(data);
              socketFlag.isNewBankNiftySnapshot = true;
              socketFlag.isExpoFinalDataBankNifty = false;
              saveSnapshot(data, "60", product.BANKNIFTY);
            }
          }
          // messages when get history for option symols for 1 min data
          else if (data.MessageType === messageTypes.HistoryOHLCResult) {
            // check if string contains BANKNIFTY if yes then store in bankniftylist
            const { Request, Result } = data;
            const userTag = String(Request.UserTag);

            // storing NIFTY & BANKNIFTY 30 sec snapshots
            if (userTag === "FutureHistory") {
              let item = {
                Close: 0,
                LastTradeTime: Request.From,
              };
              if (Result.length > 0) {
                item = Result[0];
              }
              socketFlag.isNewSnapshot = true;
              let interval = "60";
              // const instrumentIdNifty = generateInstrumentId("NIFTY");
              const instrumentIdNifty = "NIFTY 50";
              if (Request.InstrumentIdentifier === instrumentIdNifty) {
                dataListNifty.push(item);
                socketFlag.isNewNiftySnapshot = true;
                socketFlag.isExpoFinalDataNifty = false;
                wsClient.clients.forEach((ws) => {
                  ws.send(JSON.stringify(data));
                });
                saveSnapshot(item, interval, product.NIFTY);
              } else {
                dataListBankNifty.push(item);
                socketFlag.isNewBankNiftySnapshot = true;
                socketFlag.isExpoFinalDataBankNifty = false;
                wsClient.clients.forEach((ws) => {
                  ws.send(JSON.stringify(data));
                });
                saveSnapshot(item, interval, product.BANKNIFTY);
              }
            } else {
              if (Result.length > 0) {
                const userTag = String(Request.UserTag).split("_");
                const productTag = userTag[0];
                const optionTag = userTag[1];
                let item = {
                  TradedQty: 0,
                  LastTradeTime: Request.From,
                };
                if (Result.length > 0) {
                  item = Result[0];
                }
                const listItem = {
                  ...item,
                  Product: productTag,
                  OptionType: optionTag,
                };
                let interval = "60";
                if (productTag === product.NIFTY) {
                  optionReqListNifty.push(listItem);
                  // save nifty option data to database
                  saveOptionData(
                    listItem,
                    interval,
                    product.NIFTY,
                    Request.InstrumentIdentifier
                  );
                } else {
                  optionReqListBankNifty.push(listItem);
                  // save banknifty option data to database
                  saveOptionData(
                    listItem,
                    interval,
                    product.BANKNIFTY,
                    Request.InstrumentIdentifier
                  );
                }
              }
            }
          }
          // messages when get history option/future symbols for tick by tick result
          else if (
            data.MessageType === messageTypes.HistoryTickResult &&
            data.MessageType !== messageTypes.RequestError
          ) {
            // check if string contains BANKNIFTY if yes then store in bankniftylist
            const { Request, Result } = data;
            const userTag = String(Request.UserTag);
            let interval = "30";

            // storing NIFTY & BANKNIFTY 30 sec snapshots
            if (userTag === "FutureHistory") {
              let listItem = {
                LastTradePrice: 0,
                LastTradeTime: Request.From,
              };
              if (Result.length > 0) {
                listItem = Result[0];
              }
              socketTickFlag.isNewTickSnapshot = true;
              // const instrumentIdNifty = generateInstrumentId("NIFTY");
              const instrumentIdNifty = "NIFTY 50";
              if (Request.InstrumentIdentifier === instrumentIdNifty) {
                dataTickListNifty.push(listItem);
                socketTickFlag.isNewTickNiftySnapshot = true;
                socketTickFlag.isExpoTickFinalData = false;
                // save nifty option data to database
                saveSnapshot(listItem, interval, product.NIFTY);
              } else {
                dataTickListBankNifty.push(listItem);
                socketTickFlag.isNewTickBankNiftySnapshot = true;
                socketTickFlag.isExpoTickFinalDataBankNifty = false;
                // save bank nifty option data to database
                saveSnapshot(listItem, interval, product.BANKNIFTY);
              }
            }
            // messages for history option symbol
            else {
              if (Result.length > 0) {
                // loop through all 30 items of option histoy and add the volume and generate new option history item
                let sumVol = 0;
                let firstItem = Result[0];
                Result.forEach((item) => {
                  const volume = parseFloat(item.TradedQty);
                  sumVol = parseFloat(sumVol) + parseFloat(volume);
                });
                const splitTag = userTag.split("_");
                const productTag = splitTag[0];
                const optionTag = splitTag[1];
                const timestamp = splitTag[2];
                firstItem = {
                  ...firstItem,
                  LastTradeTime: parseInt(timestamp),
                  TradedQty: sumVol,
                };
                const listItem = {
                  ...firstItem,
                  Product: productTag,
                  OptionType: optionTag,
                };
                if (productTag === product.NIFTY) {
                  optionTickReqListNifty.push(listItem);
                  saveOptionData(
                    listItem,
                    interval,
                    product.NIFTY,
                    Request.InstrumentIdentifier
                  );
                } else {
                  optionTickReqListBankNifty.push(listItem);
                  saveOptionData(
                    listItem,
                    interval,
                    product.BANKNIFTY,
                    Request.InstrumentIdentifier
                  );
                }
              }
            }
          }
        }
      });

      function doClose() {
        connection.close();
        console.log("Global data instance has stopped!", moment().utcOffset(330).toDate());

      }

      function callAPI(request) {
        console.log("request: *****" + request + "*****");
        if (connection.connected) {
          connection.sendUTF(request);
        }
      }
      function Authenticate() {
        if (connection.connected) {
          strMessage =
            '{"MessageType":"Authenticate","Password":"' + accesskey + '"}';
          callAPI(strMessage);
        }
      }
    });

    // Todo uncomment and schedule handling
    client.connect(endpoint);
    const job = schedule.scheduleJob("globalSocket", rule, () => {});
  },
};

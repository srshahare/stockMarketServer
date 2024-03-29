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
  indexListNifty,
  indexListBankNifty,
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
const { sendWSMessage } = require("../helpers/sendMessage");
const { syncControllers } = require("../controllers/request/syncControllers");
const { GetFutureHistory } = require("./socketManager");
const { generateFeed } = require("../helpers/generateRealTimeFeed");

var client = new websocketClient();

module.exports = {
  globalDataSocketInstance: (wsClient) => {
    var endpoint = "ws://nimblewebstream.lisuns.com:4575/";
    var accesskey = "2cdf0c7e-aedd-4e33-897e-bfe99951fd53";
    moment.tz.setDefault("Asia/Kolkata");
    let conn;

    const rule = new schedule.RecurrenceRule();
    rule.tz = "Asia/Kolkata";
    rule.dayOfWeek = [0, new schedule.Range(1, 5)];
    rule.hour = 9;
    rule.minute = 15;

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
          const { requestType, exchange, duration, subscribe } = serverData;
          socket.messageData = serverData;
          try {
            if (requestType === "Connect") {
              conn.close();
              const msg4 = "Global data instance has stopped!";
              console.log(msg4, moment().toDate());
              setTimeout(() => {
                client.connect(endpoint);
              }, 3000); // connect after 3 seconds
            }
            if (requestType === "Sync") {
              syncControllers(conn);
            }
            if (!requestType || !exchange || !duration) {
              return socket.send(
                JSON.stringify({
                  MessageType: "RequestError",
                  message:
                    "requestType, exchange, duration (Required Parameters)",
                })
              );
            }

            if (requestType === types.GetMinuteData) {
              // send first chunk of data
              // const d = await fetchLatestExpoAvgData(exchange, "60", duration);
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
            } else if (requestType === types.GetIndexData) {
              // send first chunk of data
              // const data = await fetchLatestVolumeData(exchange, "30");
              // const refactoredData = await refactorFinalData(data, "vol");
              const data =
                exchange === product.NIFTY
                  ? indexListNifty
                  : indexListBankNifty;
              const expoData =
                exchange === product.NIFTY
                  ? finalListNifty[duration]
                  : finalListBankNifty[duration];
              const msgData = {
                MessageType: "GetIndexData",
                Request: {
                  count: data.length,
                  Interval: "60",
                  Exchange: exchange,
                  Duration: duration,
                },
                Result: {
                  expoData,
                  indexData: data
                },
              };
              socket.send(JSON.stringify(msgData));
              callDone = true;
            } else if (requestType === types.GetBothData) {
              const niftyData = finalListNifty[duration];
              const bankData = finalListBankNifty[duration];
              const msgDataNifty = {
                MessageType: "GetMinuteData",
                Request: {
                  count: niftyData.length,
                  Interval: "60",
                  Exchange: product.NIFTY,
                  Duration: duration,
                },
                Result: niftyData,
              };
              socket.send(JSON.stringify(msgDataNifty));
              const msgDataBank = {
                MessageType: "GetMinuteData",
                Request: {
                  count: bankData.length,
                  Interval: "60",
                  Exchange: product.BANKNIFTY,
                  Duration: duration,
                },
                Result: bankData,
              };
              socket.send(JSON.stringify(msgDataBank));
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
      conn = connection;
      var AuthConnect = false;
      var callDone = false;
      var initialized = false;
      let mainInterval = null;

      // checksum variables
      let checkCounter = optionVolListNifty.length;

      Authenticate();

      const checkRule = new schedule.RecurrenceRule();
      checkRule.tz = "Asia/Kolkata";
      checkRule.dayOfWeek = [0, new schedule.Range(1, 5)];
      checkRule.hour = 9;
      checkRule.minute = 16;
      checkRule.second = 10;
      const checksumJob = schedule.scheduleJob("checksum", checkRule, () => {
        // initialize exactly at 9:16:10 am
        // resyncData();
      });

      function resyncData() {
        try {
          console.log("Data Checksum is initialized!");
          checkCounter += 1;
          socketInterval.checksumInterval = setInterval(() => {
            // check if data is coming every minute
            checkCounter += 1;
            if (checkCounter > optionVolListNifty.length) {
              // data has stopped coming reinitialize intervalController
              // get the last unsynced element
              console.log(
                "Reinitializing the controllers!, ",
                moment().toDate()
              );
              // const lastItem = optionVolListNifty.at(-1);
              // const lastTimestamp = lastItem.tradeTime + 60;

              clearAllIntervals();
              clearAllQueues(true); // not clearing expo and vol queues

              minuteReqController(connection, wsClient);
              checkCounter = optionVolListNifty.length;
              // setTimeout(() => {
              //   [("NIFTY 50", "NIFTY BANK")].forEach((inst) => {
              //     GetFutureHistory(
              //       connection,
              //       inst,
              //       lastTimestamp,
              //       lastTimestamp,
              //       "FutureHistory"
              //     );
              //   });
              // }, 3000);
            }
          }, 60000); // checksum for each minute
        } catch (err) {
          console.log(err);
        }
      }

      //Todo remove comment
      setTimeout(() => {
        clearAllQueues(false); // clear all queues

        setTimeout(() => {
          console.log("controllers initiated!, ", moment().toDate());
          // let msg1 = "minute controller initiated successfully!";
          // const msg2 = "tick controller initiated successfully!";
          // sendWSMessage(wsClient, msg1);
          // sendWSMessage(wsClient, msg2);
          // tickReqController(connection, wsClient);
          minuteReqController(connection, wsClient);

          //Todo (Dev) generate real time feed
          // generateFeed(connection);
        }, 500);

        // let tempInterval;
        // tempInterval = setInterval(() => {
        //   if (AuthConnect && !initialized) {
        //     initialized = true;
        //     // clear all queues before initializing
        //     clearAllQueues();
        //     setTimeout(() => {
        //       console.log("controllers initiated!, ", moment().toDate());
        //       let msg1 = "minute controller initiated successfully!";
        //       const msg2 = "tick controller initiated successfully!";
        //       sendWSMessage(wsClient, msg1);
        //       sendWSMessage(wsClient, msg2);
        //       tickReqController(connection, wsClient);
        //       minuteReqController(connection, wsClient);
        //       clearInterval(tempInterval);
        //     }, 2000);
        //   } else if (!AuthConnect || !initialized) {
        //     Authenticate();
        //   } else {
        //     clearInterval(tempInterval);
        //   }
        // }, 5000); // check if user is authenticated after each 5 sec
      }, 50000); // wait for 50 seconds

      // Todo minute interval
      mainInterval = setInterval(() => {
        moment.tz.setDefault("Asia/Kolkata");
        const currentTime = moment().unix(); // 330 hours for 5:30 GMT offset

        const globalDataEndTime = moment()
          .set("hour", 15)
          .set("minute", 30)
          .unix();
        if (currentTime > globalDataEndTime) {
          // close the global data feed connection
          setTimeout(() => {
            doClose();
            clearAllIntervals();
            clearInterval(mainInterval);
          }, 5000);
        }
      }, 60000); // loop each minute

      function clearAllIntervals() {
        const msg3 = "Instance cleared all intervals!";
        console.log(msg3, moment().toDate());
        const {
          niftyPipeInterval,
          bankNiftyPipeInterval,
          niftyTickPipeInterval,
          bankNiftyTickPipeInterval,
          tickInterval,
          minuteInterval,
          tickMsgInterval,
          minuteMsgInterval,
          checksumInterval,
        } = socketInterval;

        clearInterval(niftyPipeInterval);
        clearInterval(bankNiftyPipeInterval);
        clearInterval(niftyTickPipeInterval);
        clearInterval(bankNiftyTickPipeInterval);
        clearInterval(tickInterval);
        // clearInterval(minuteInterval);
        clearInterval(tickMsgInterval);
        clearInterval(minuteMsgInterval);
        clearInterval(checksumInterval);
      }

      function clearAllQueues(preserved) {
        // close the socket
        const msg3 = "Instance cleared all queues!";
        console.log(msg3, moment().toDate());
        // sendWSMessage(wsClient, msg3);
        // reinitialize all states
        socketFlag.isNewSnapshot = false;
        socketFlag.isNewNiftySnapshot = false;
        socketFlag.isNewBankNiftySnapshot = false;
        socketFlag.isOptionNiftyFetched = false;
        socketFlag.isOptionBankNiftyFetched = false;
        socketFlag.isOptionSumNiftyDone = false;
        socketFlag.isOptionSumBankNiftyDone = false;
        socketFlag.isExpoFinalDataNifty = false;
        socketFlag.isExpoFinalDataBankNifty = false;

        // clear all the queues
        indexListNifty.splice(0, indexListNifty.length);
        indexListBankNifty.splice(0, indexListBankNifty.length);
        dataListNifty.splice(0, dataListNifty.length);
        dataListBankNifty.splice(0, dataListBankNifty.length);
        dataTickListNifty.splice(0, dataTickListNifty.length);
        dataTickListBankNifty.splice(0, dataTickListBankNifty.length);

        optionReqListNifty.splice(0, optionReqListNifty.length);
        optionReqListBankNifty.splice(0, optionReqListBankNifty.length);
        optionTickReqListNifty.splice(0, optionTickReqListNifty.length);
        optionTickReqListBankNifty.splice(0, optionTickReqListBankNifty.length);

        if (!preserved) {
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
        }
      }

      connection.on("error", function (error) {
        console.log(error);
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
            wsClient.clients.forEach((ws) => {
              if (ws.isAlive) {
                ws.send(JSON.stringify(data));
              }
            });
          }

          // storing NIFTY & BANKNIFTY 1 min snapshots
          // Todo : check the if stmt again to generate real time snapshot
          if (data.MessageType === messageTypes.RealtimeSnapshotResult) {
            socketFlag.isNewSnapshot = true;
            // const instrumentIdNifty = generateInstrumentId("NIFTY");
            const instrumentIdNifty = "NIFTY 50";
            const month = moment().month();
            const date = moment().date();
            const year = moment().year();
            let fromTime = moment([year, month, date, 9, 15, 00, 00]).unix();
            let listItem = {
              exchange: product.NIFTY,
              interval: "60",
              dataType: "IndexData",
              duration: "0",
              tradeTime: data.LastTradeTime,
              date: moment
                .unix(data.LastTradeTime)
                .format("DD/MM/YYYY hh:mm:ss"),
              data: data,
            };
            if (data.LastTradeTime >= fromTime) {
              socketTickFlag.tickTimerDone = false;
              if (data.InstrumentIdentifier === instrumentIdNifty) {
                dataListNifty.push(data);
                dataTickListNifty.push(data);
                listItem = {
                  ...listItem,
                  exchange: product.NIFTY,
                };
                indexListNifty.push(listItem);
                // sendWSMessage(wsClient, listItem);

                // for min data
                socketFlag.isNewNiftySnapshot = true;
                socketFlag.isExpoFinalDataNifty = false;
                saveSnapshot(listItem, "60", product.NIFTY);

                // for tick data
                socketTickFlag.isNewTickNiftySnapshot = true;
                socketTickFlag.isExpoTickFinalData = false;
                // saveSnapshot(data, "30", product.NIFTY);
              } else {
                dataListBankNifty.push(data);
                dataTickListBankNifty.push(data);
                listItem = {
                  ...listItem,
                  exchange: product.BANKNIFTY,
                };
                indexListBankNifty.push(listItem);
                // sendWSMessage(wsClient, listItem);

                // for min data
                socketFlag.isNewBankNiftySnapshot = true;
                socketFlag.isExpoFinalDataBankNifty = false;
                saveSnapshot(listItem, "60", product.BANKNIFTY);

                // for tick data
                socketTickFlag.isNewTickBankNiftySnapshot = true;
                socketTickFlag.isExpoTickFinalDataBankNifty = false;
                // saveSnapshot(data, "30", product.BANKNIFTY);
              }
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
              let tickInterval = "30";
              // const instrumentIdNifty = generateInstrumentId("NIFTY");
              const instrumentIdNifty = "NIFTY 50";
              socketTickFlag.tickTimerDone = false;
              let listItem = {
                exchange: product.NIFTY,
                interval: "60",
                dataType: "IndexData",
                duration: "0",
                tradeTime: item.LastTradeTime,
                date: moment
                  .unix(item.LastTradeTime)
                  .format("DD/MM/YYYY hh:mm:ss"),
                data: item,
              };

              if (Request.InstrumentIdentifier === instrumentIdNifty) {
                if (Result.length > 0) {
                  dataListNifty.push(item);
                  dataTickListNifty.push(item);
                  listItem = {
                    ...listItem,
                    exchange: product.NIFTY,
                  };
                  indexListNifty.push(listItem);
                  // sendWSMessage(wsClient, listItem);
                }
                // for min data
                socketFlag.isNewNiftySnapshot = true;
                socketFlag.isExpoFinalDataNifty = false;
                saveSnapshot(listItem, interval, product.NIFTY);

                // for tick data
                socketTickFlag.isNewTickNiftySnapshot = true;
                socketTickFlag.isExpoTickFinalData = false;
                // saveSnapshot(item, tickInterval, product.NIFTY);
              } else {
                if (Result.length > 0) {
                  dataListBankNifty.push(item);
                  dataTickListBankNifty.push(item);
                  listItem = {
                    ...listItem,
                    exchange: product.BANKNIFTY,
                  };
                  indexListBankNifty.push(listItem);
                  // sendWSMessage(wsClient, listItem);
                }
                // for min data
                socketFlag.isNewBankNiftySnapshot = true;
                socketFlag.isExpoFinalDataBankNifty = false;
                saveSnapshot(listItem, interval, product.BANKNIFTY);

                // for tick data
                socketTickFlag.isNewTickBankNiftySnapshot = true;
                socketTickFlag.isExpoTickFinalDataBankNifty = false;
                // saveSnapshot(item, tickInterval, product.BANKNIFTY);
              }
            } else {
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
                // saveOptionData(
                //   listItem,
                //   interval,
                //   product.NIFTY,
                //   Request.InstrumentIdentifier
                // );
              } else {
                optionReqListBankNifty.push(listItem);
                // save banknifty option data to database
                // saveOptionData(
                //   listItem,
                //   interval,
                //   product.BANKNIFTY,
                //   Request.InstrumentIdentifier
                // );
              }
            }
          }
          // messages when get history option/future symbols for tick by tick result
          else if (data.MessageType === messageTypes.HistoryTickResult) {
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
                if (Result.length > 0) {
                  dataTickListNifty.push(listItem);
                }
                socketTickFlag.isNewTickNiftySnapshot = true;
                socketTickFlag.isExpoTickFinalData = false;
                // saveSnapshot(listItem, interval, product.NIFTY);
              } else {
                if (Result.length > 0) {
                  dataTickListBankNifty.push(listItem);
                }
                socketTickFlag.isNewTickBankNiftySnapshot = true;
                socketTickFlag.isExpoTickFinalDataBankNifty = false;
                // saveSnapshot(listItem, interval, product.BANKNIFTY);
              }
            }
            // messages for history option symbol
            else {
              // loop through all 30 items of option histoy and add the volume and generate new option history item
              let sumVol = 0;
              const splitTag = userTag.split("_");
              const productTag = splitTag[0];
              const optionTag = splitTag[1];
              const timestamp = splitTag[2];
              let firstItem = {
                LastTradeTime: parseInt(timestamp),
                TradedQty: sumVol,
              };
              if (Result.length > 0) {
                firstItem = Result[0];
              }
              Result.forEach((item) => {
                const volume = parseFloat(item.TradedQty);
                sumVol = parseFloat(sumVol) + parseFloat(volume);
              });
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
                // saveOptionData(
                //   listItem,
                //   interval,
                //   product.NIFTY,
                //   Request.InstrumentIdentifier
                // );
              } else {
                optionTickReqListBankNifty.push(listItem);
                // saveOptionData(
                //   listItem,
                //   interval,
                //   product.BANKNIFTY,
                //   Request.InstrumentIdentifier
                // );
              }
            }
          }
        }
      });

      function doClose() {
        connection.close();
        const msg4 = "Global data instance has stopped!";
        console.log(msg4, moment().toDate());
        sendWSMessage(wsClient, msg4);
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
    const job = schedule.scheduleJob("globalSocket", rule, () => {
      const msg5 = "Global data instance initiated!, ";
      console.log(msg5, moment().toDate());
      sendWSMessage(wsClient, msg5);
      client.connect(endpoint);
    });
    client.connect(endpoint);
  },
};

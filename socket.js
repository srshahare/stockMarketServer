const schedule = require("node-schedule");
const moment = require("moment");

const { globalDataSocketInstance } = require("./listeners/globalDataSocket");
const { subscribeSnapshot } = require("./listeners/socketManager");
const fs = require("fs");
const { Server } = require("ws");
require("dotenv").config();

let wss;
module.exports = {
  wsInstance: (server) => {
    wss = new Server({ server });

    // const rule = new schedule.RecurrenceRule();
    // rule.dayOfWeek = [0, new schedule.Range(1, 5)];
    // rule.hour = 22;
    // rule.minute = 06;
    // const job = schedule.scheduleJob("globalSocket", rule, () => {
    // });
    globalDataSocketInstance(wss);

    // wss.on("connection", (socket, req) => {

    //   // globalDataSocketInstance(socket);

    //   socket.isAlive = true;
    //   socket.on("pong", () => {
    //     heartbeat(socket);
    //   });

    //   // socket.on("message", async function incoming(data) {
    //   //   // const d = Buffer.from(JSON.stringify(data)) // string to buffer
    //   //   const d = JSON.parse(data.toString());

    //   //   const sendData = JSON.stringify(d);

    //   //   // subscribeSnapshot(connection)

    //   //   // socket.send(sendData);
    //   // });

    //   socket.on("error", function (error) {
    //     console.log("Connection Error: ", error);
    //   });
    // });

    // const heartbeat = (ws) => {
    //   ws.isAlive = true;
    // };

    // const ping = (ws) => {
    //   const data = {
    //     MessageType: "Beat",
    //   };
    //   const parsedData = JSON.stringify(data);
    //   ws.send(parsedData);
    // };

    // const interval = setInterval(() => {
    //   wss.clients.forEach((ws) => {
    //     if (ws.isAlive === false) {
    //       return ws.terminate();
    //     }

    //     ws.isAlive = false;
    //     ws.ping(() => {
    //       ping(ws);
    //     });
    //   });
    // }, 2000);
  },
};

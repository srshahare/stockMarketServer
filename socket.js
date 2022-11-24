const { globalDataSocketInstance } = require("./listeners/globalDataSocket");
const { Server } = require("ws");
require("dotenv").config();

let wss;
module.exports = {
  wsInstance: (server) => {
    wss = new Server({ server });

    globalDataSocketInstance(wss);
  },
};

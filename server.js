require("dotenv").config();
const schedule = require("node-schedule");
const express = require("express");
const cors = require("cors");
const http = require("http");

//* Importing database
const db = require("./models");

//* Importing socket
const socket = require("./socket");
const { globalDataSocketInstance } = require("./listeners/globalDataSocket");

//* Instance of express app
const app = express();

//* Utilities / Configuration
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//* Database Configuration
db.sequelize.sync({ force: false }).then(() => {
  console.log("DB Synced!");
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

//* Creating server instance
const server = http.createServer(app);
socket.wsInstance(server);

// schedule job for every week day (Mon, Tue, Wed, Thu, Fri)
// const rule = new schedule.RecurrenceRule()
// rule.dayOfWeek = [0, new schedule.Range(1, 5)]
// rule.hour = 22;
// rule.minute = 06;

// const job = schedule.scheduleJob("globalSocket", rule, () => {
//   globalDataSocketInstance(null)
// })

//* Running server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("database HOST, ", process.env.QOVERY_POSTGRESQL_ZEC72C406_HOST_INTERNAL);
  console.log("Server is running on port,", PORT);
});

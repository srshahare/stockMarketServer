require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { fetchSnapshots } = require("./controllers/database/snapshotController")
const { fetchExpoAvgData } = require("./controllers/database/expoAvgController");

//Todo Importing database
const db = require("./models");

//* Importing socket
const socket = require("./socket");

//* Instance of express app
const app = express();

//* Utilities / Configuration
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//Todo Database Configuration
db.sequelize.sync({ force: false }).then(() => {
  console.log("DB Synced!");
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

app.use("/data", require("./routes/data.routes"))

app.get("/status", (req, res, next) => {
  res.status(200).json({
    status: "Ok",
    message: "Server is Running"
  })
})

app.get("/indexData", async (req, res) => {
  const { exchange, interval, fromTime, toTime } = req.query;
  const result = await fetchSnapshots(exchange, interval, fromTime, toTime)
  if(!result) {
    return res.status(400).json({
      message: "Error fetching data"
    })
  }
  res.status(200).json({
    data: result
  })
})

app.get("/expoData", async (req, res) => {
  const { exchange, interval, duration, fromTime, toTime } = req.query;
  const result = await fetchExpoAvgData(exchange, interval, duration, fromTime, toTime)
  if(!result) {
    return res.status(400).json({
      message: "Error fetching data"
    })
  }
  res.status(200).json({
    data: result
  })
})


//* Creating server instance
const server = http.createServer(app);
socket.wsInstance(server, app);


//* Running server
const PORT = process.env.PORT || 5080;
server.listen(PORT, () => {
  console.log("database HOST, ", process.env.DB_HOST);
  console.log("Server is running on port,", PORT);
});

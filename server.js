require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const https = require("https")

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
db.sequelize.sync({ force: true }).then(() => {
  console.log("DB Synced!");
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

app.get("/status", (req, res, next) => {
  res.status(200).json({
    status: "Ok",
    message: "Server is Running"
  })
})


//* Creating server instance
const server = https.createServer(app);
socket.wsInstance(server, app);


//* Running server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("database HOST, ", process.env.DB_HOST);
  console.log("Server is running on port,", PORT);
});

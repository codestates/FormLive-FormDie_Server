const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/key");

const https = require("https");
const fs = require("fs");

// certificate;
const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/yangsikdang.ml/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/yangsikdang.ml/cert.pem",
  "utf8"
);

const ca = fs.readFileSync(
  "/etc/letsencrypt/live/yangsikdang.ml/chain.pem",
  "utf8"
);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

const https_server = https.createServer(credentials, app);
// const mongoose = require("mongoose");
// mongoose
//   .connect(config.mongoURI, { useNewUrlParser: true })
//   .then(() => console.log("DB connected"))
//   .catch(err => console.error(err));

const mongoose = require("mongoose");
const connect = mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.send({ data: "OK" });
});

app.post("/api", (req, res) => {
  console.log(req.body);
  res.send({ data: "OK" });
});

// const port = process.env.PORT || 5000;

// app.listen(port, () => {
//   console.log(`Server Running at ${port}`);
// });

https_server.listen("8443", () => {
  console.log(`https Server Running at 8443`);
});
